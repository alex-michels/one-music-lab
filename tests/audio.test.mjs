import { test } from 'vitest';
import assert from 'node:assert/strict';
import { AudioEngine } from '../lib/audio.ts';
class Param {
  value = 0;
  events = [];
  setTargetAtTime(...v) {
    this.events.push(['target', ...v]);
  }
  setValueAtTime(...v) {
    this.events.push(['set', ...v]);
  }
  linearRampToValueAtTime(...v) {
    this.events.push(['ramp', ...v]);
  }
  cancelScheduledValues(...v) {
    this.events.push(['cancel', ...v]);
  }
}
class Node {
  gain = new Param();
  frequency = new Param();
  started = [];
  stopped = [];
  connect() {}
  disconnect() {}
  start(t) {
    this.started.push(t);
  }
  stop(t) {
    this.stopped.push(t);
  }
}
class Context {
  sampleRate = 48000;
  currentTime = 10;
  destination = {};
  oscillators = [];
  gains = [];
  resume() {
    return Promise.resolve();
  }
  createGain() {
    const n = new Node();
    this.gains.push(n);
    return n;
  }
  createOscillator() {
    const n = new Node();
    this.oscillators.push(n);
    return n;
  }
  createAnalyser() {
    return {
      connect() {},
      getByteTimeDomainData(a) {
        a.fill(128);
      },
    };
  }
  close() {
    return Promise.resolve();
  }
}
globalThis.AudioContext = Context;
test('A sustained tone fades in, follows frequency changes, and stops', async () => {
  const audio = new AudioEngine();
  assert.equal(await audio.start(432, 'triangle', 0.2), true);
  const osc = audio.context.oscillators[0];
  assert.equal(osc.frequency.value, 432);
  assert.equal(osc.type, 'triangle');
  assert.equal(osc.started.length, 1);
  audio.update(864, 'square', 0.1);
  assert.equal(osc.type, 'square');
  assert.ok(
    osc.frequency.events.some((e) => e[0] === 'target' && e[1] === 864),
  );
  audio.stopAll();
  assert.equal(osc.stopped.length, 1);
  assert.ok(osc.stopped[0] > audio.context.currentTime);
  audio.dispose();
});
test('Stopping during AudioContext resume cancels pending start', async () => {
  const audio = new AudioEngine();
  let resume;
  audio.context.resume = () =>
    new Promise((resolve) => {
      resume = resolve;
    });
  const start = audio.start(440, 'sine', 0.18);
  audio.stopAll();
  resume();
  assert.equal(await start, false);
  assert.equal(audio.context.oscillators.length, 0);
  audio.dispose();
});
test('Sequential preview schedules notes with explicit spacing and silence stops all', async () => {
  const audio = new AudioEngine();
  await audio.preview([440, 550, 660], 'sine', 0.18, 0.6, 0.75);
  const oscillators = audio.context.oscillators;
  assert.equal(oscillators.length, 3);
  assert.deepEqual(
    oscillators.map((o) => o.frequency.value),
    [440, 550, 660],
  );
  assert.ok(
    Math.abs(oscillators[1].started[0] - oscillators[0].started[0] - 0.75) <
      1e-9,
  );
  audio.stopAll();
  assert.ok(oscillators.every((o) => o.stopped.length === 2));
  audio.dispose();
});
/**
 * The three places a voice can be when it is interrupted. `at` is the audio
 * clock at the moment of the stop; the preview was scheduled at 10 s, so its
 * first voice starts at 10.01 s and rises until 10.03 s.
 */
async function interrupted(at, frequencies = [440, 550], spacing = 0.75) {
  const audio = new AudioEngine();
  await audio.preview(frequencies, 'triangle', 0.18, 0.6, spacing);
  const oscillators = [...audio.context.oscillators];
  // The first gain node is the master; the rest belong to the voices in order.
  const gains = audio.context.gains.slice(1).map((node) => node.gain);
  const scheduled = gains.map((gain) => gain.events.length);
  audio.context.currentTime = at;
  audio.stopAll();
  return {
    audio,
    voices: oscillators.map((oscillator, index) => ({
      start: oscillator.started[0],
      // What the stop added, after the envelope the preview scheduled.
      added: gains[index].events.slice(scheduled[index]),
      stop: oscillator.stopped.at(-1),
      stops: oscillator.stopped.length,
    })),
  };
}
test('A sounding voice is released over a few milliseconds and then stopped', async () => {
  const at = 10.3;
  const { audio, voices } = await interrupted(at);
  const [sounding] = voices;
  assert.ok(sounding.start + 0.02 < at, 'the voice is past its attack');
  // The scheduled decay is dropped first, then the level goes to silence.
  assert.deepEqual(
    sounding.added.map((event) => event[0]),
    ['cancel', 'target'],
  );
  const [cancel, release] = sounding.added;
  assert.equal(cancel[1], at);
  assert.deepEqual(release.slice(1, 3), [0, at]);
  // A release of a few milliseconds, not a whole note and not an instant cut.
  assert.ok(release[3] > 0.005 && release[3] <= 0.03);
  // The oscillator outlives the release (several time constants) and then ends.
  assert.ok(sounding.stop >= at + 4 * release[3]);
  assert.ok(sounding.stop <= at + 0.15);
  audio.dispose();
});
test('A voice that has not started yet is stopped before it can sound, with its envelope untouched', async () => {
  // 10.75 s: the second voice is due 10 ms later, inside the release window of
  // the first. Releasing it like a sounding voice would cancel its "start from
  // silence" and let it be heard at the gain's default level.
  for (const at of [10.3, 10.75, 10.76]) {
    const { audio, voices } = await interrupted(at);
    const later = voices[1];
    assert.ok(later.start >= at, `voice 2 has not started at ${at}`);
    assert.deepEqual(later.added, [], 'its envelope is left as scheduled');
    assert.equal(later.stop, at);
    assert.ok(later.stop <= later.start, 'it ends before it would begin');
    audio.dispose();
  }
});
test('A voice caught in its attack finishes the rise and is released from its end', async () => {
  const at = 10.015; // 5 ms into the 20 ms rise of the first voice
  const { audio, voices } = await interrupted(at, [440]);
  const [rising] = voices;
  assert.ok(rising.start < at && at < rising.start + 0.02);
  const [cancel, release] = rising.added;
  // The cancel begins after the ramp ends, so the ramp itself survives: a ramp
  // cancelled while it runs snaps the level back to where it began.
  assert.equal(cancel[0], 'cancel');
  assert.ok(cancel[1] > rising.start + 0.02);
  assert.equal(release[0], 'target');
  assert.equal(release[1], 0);
  assert.equal(release[2], cancel[1]);
  assert.ok(rising.stop > release[2] + 4 * release[3]);
  // Still prompt: the whole thing is over within a tenth of a second.
  assert.ok(rising.stop < at + 0.12);
  audio.dispose();
});
test('Starting a new preview ends the previous one the same way, and nothing is stopped twice', async () => {
  const audio = new AudioEngine();
  await audio.preview([660], 'sine', 0.18);
  const first = audio.context.oscillators[0];
  const firstGain = audio.context.gains[1].gain;
  const scheduled = firstGain.events.length;
  audio.context.currentTime = 10.4;
  await audio.preview([880], 'sine', 0.18);
  assert.equal(audio.context.oscillators.length, 2);
  // The first voice was sounding: released at the moment the second was asked for.
  const added = firstGain.events.slice(scheduled);
  assert.deepEqual(
    added.map((event) => event[0]),
    ['cancel', 'target'],
  );
  assert.equal(added[0][1], 10.4);
  assert.deepEqual(added[1].slice(1, 3), [0, 10.4]);
  assert.equal(first.stopped.length, 2);
  // It is no longer tracked, so a later stop leaves it alone.
  audio.context.currentTime = 10.5;
  audio.stopAll();
  audio.stopAll();
  assert.equal(first.stopped.length, 2);
  assert.equal(audio.context.oscillators[1].stopped.length, 2);
  audio.dispose();
});
test('One voice the engine refuses to stop does not leave the others sounding', async () => {
  const audio = new AudioEngine();
  await audio.preview([440, 550, 660], 'sine', 0.18, 1.5, 0);
  const [refusing, ...others] = audio.context.oscillators;
  // Older engines throw when a node is stopped a second time.
  refusing.stop = () => {
    throw new DOMException('cannot stop', 'InvalidStateError');
  };
  audio.context.currentTime = 10.5;
  assert.doesNotThrow(() => audio.stopAll());
  for (const voice of others) assert.equal(voice.stopped.length, 2);
  // And the refused voice is forgotten rather than retried forever.
  assert.doesNotThrow(() => audio.stopAll());
  audio.dispose();
});
test('A chord divides gain across voices and skips frequencies beyond Nyquist', async () => {
  const audio = new AudioEngine();
  await audio.preview([440, 550, 660, 25000], 'sine', 0.18, 1.5, 0);
  assert.equal(audio.context.oscillators.length, 3);
  for (const gain of audio.context.gains.slice(1))
    assert.ok(gain.gain.events.some((e) => e[0] === 'ramp' && e[1] === 0.25));
  audio.dispose();
});
