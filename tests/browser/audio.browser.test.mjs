import { expect, test } from 'vitest';
import { AudioEngine } from '../../lib/audio.ts';
import { encodeWav } from '../../lib/wav.ts';

// These run in Chromium, Firefox and WebKit against the browser's own Web
// Audio implementation. A mocked AudioContext can only show that calls were
// made; rendering the graph offline shows what would actually be heard.

const RATE = 48000;

// Playwright ships a WebKit build without Web Audio, so these cannot run
// there; that engine is covered by the DOM tests, and real Safari stays an
// open device item in ROADMAP P00. Skipping is reported, never silent.
const OfflineContext =
  globalThis.OfflineAudioContext ?? globalThis.webkitOfflineAudioContext;
const audioTest = OfflineContext ? test : test.skip;

/**
 * Builds the engine on an OfflineAudioContext of the given length. Rendering
 * is deterministic and needs no audio device, so the same assertions hold on
 * every engine and in CI.
 */
function offlineEngine(seconds, sampleRate = RATE) {
  class RenderContext extends OfflineContext {
    started = false;
    constructor() {
      super(1, Math.round(sampleRate * seconds), sampleRate);
    }
    // The engine resumes before it schedules. Offline rendering may only be
    // resumed once it is running, so before that this is a no-op.
    resume() {
      return this.started ? super.resume() : Promise.resolve();
    }
    render() {
      this.started = true;
      return this.startRendering();
    }
  }
  const original = globalThis.AudioContext;
  globalThis.AudioContext = RenderContext;
  try {
    return new AudioEngine();
  } finally {
    globalThis.AudioContext = original;
  }
}

/** Peak amplitude of a window, in samples. */
function peak(channel, from = 0, to = channel.length) {
  let max = 0;
  for (let i = from; i < to; i++) max = Math.max(max, Math.abs(channel[i]));
  return max;
}

/** Root mean square of a window: how loud that stretch actually is. */
function rms(channel, from = 0, to = channel.length) {
  let sum = 0;
  for (let i = from; i < to; i++) sum += channel[i] * channel[i];
  return Math.sqrt(sum / Math.max(1, to - from));
}

/**
 * Frequency from counting rising zero crossings. For the steady part of a
 * single tone this is accurate to well under a hertz and needs no FFT.
 */
function frequency(channel, sampleRate, from, to) {
  let first = -1;
  let last = -1;
  let crossings = 0;
  for (let i = from + 1; i < to; i++) {
    if (channel[i - 1] <= 0 && channel[i] > 0) {
      if (first < 0) first = i;
      last = i;
      crossings++;
    }
  }
  if (crossings < 2) return 0;
  return ((crossings - 1) * sampleRate) / (last - first);
}

const seconds = (t) => Math.round(t * RATE);

audioTest('A started tone is audible at the requested frequency', async () => {
  const engine = offlineEngine(0.5);
  expect(await engine.start(440, 'sine', 1)).toBe(true);
  const rendered = await engine.context.render();
  const channel = rendered.getChannelData(0);

  expect(peak(channel)).toBeGreaterThan(0.01);
  expect(frequency(channel, RATE, seconds(0.1), seconds(0.4))).toBeCloseTo(
    440,
    0,
  );
});

audioTest('The attack ramps in instead of starting with a click', async () => {
  const engine = offlineEngine(0.5);
  await engine.start(440, 'sine', 1);
  const channel = (await engine.context.render()).getChannelData(0);

  expect(Math.abs(channel[0])).toBeLessThan(0.001);
  const early = rms(channel, 0, seconds(0.005));
  const settled = rms(channel, seconds(0.1), seconds(0.2));
  expect(early).toBeLessThan(settled / 2);
  expect(settled).toBeGreaterThan(0.01);

  // No sample-to-sample jump large enough to be heard as a click.
  let jump = 0;
  for (let i = 1; i < channel.length; i++)
    jump = Math.max(jump, Math.abs(channel[i] - channel[i - 1]));
  expect(jump).toBeLessThan(0.2);
});

audioTest('Stopping fades the tone out and leaves silence', async () => {
  const engine = offlineEngine(0.6);
  await engine.start(440, 'sine', 1);
  const rendering = engine.context.render();
  await engine.context.suspend(0.2);
  engine.stop();
  void engine.context.resume();
  const channel = (await rendering).getChannelData(0);

  expect(rms(channel, seconds(0.1), seconds(0.19))).toBeGreaterThan(0.01);
  expect(rms(channel, seconds(0.4), seconds(0.6))).toBeLessThan(0.0005);
});

audioTest(
  'A frequency above the Nyquist limit is clamped, not aliased',
  async () => {
    const engine = offlineEngine(0.4, 44100);
    await engine.start(30000, 'sine', 1);
    const channel = (await engine.context.render()).getChannelData(0);

    // Playing 30 kHz at 44.1 kHz without clamping folds the tone down to about
    // 14 kHz, which is plainly audible and wrong. Counting zero crossings cannot
    // resolve more finely than Nyquist itself, so the test that matters is that
    // nothing folded downwards.
    const measured = frequency(channel, 44100, seconds(0.1), seconds(0.3));
    expect(measured).toBeLessThanOrEqual(44100 / 2);
    expect(measured).toBeGreaterThan(20000);
    for (const sample of channel) expect(Number.isFinite(sample)).toBe(true);
  },
);

audioTest(
  'A sequence sounds one note at a time with silence between them',
  async () => {
    const engine = offlineEngine(1.4);
    await engine.preview([440, 660], 'sine', 1, 0.3, 0.5);
    const channel = (await engine.context.render()).getChannelData(0);

    expect(frequency(channel, RATE, seconds(0.1), seconds(0.25))).toBeCloseTo(
      440,
      0,
    );
    expect(frequency(channel, RATE, seconds(0.6), seconds(0.75))).toBeCloseTo(
      660,
      0,
    );
    expect(rms(channel, seconds(0.4), seconds(0.48))).toBeLessThan(
      rms(channel, seconds(0.1), seconds(0.25)) / 10,
    );
  },
);

audioTest('A chord shares the level between its voices', async () => {
  const chord = offlineEngine(0.8);
  await chord.preview([440, 550, 660], 'sine', 1, 0.6, 0);
  const chordPeak = peak(
    (await chord.context.render()).getChannelData(0),
    seconds(0.1),
    seconds(0.4),
  );

  const single = offlineEngine(0.8);
  await single.preview([440], 'sine', 1, 0.6, 0);
  const singlePeak = peak(
    (await single.context.render()).getChannelData(0),
    seconds(0.1),
    seconds(0.4),
  );

  expect(chordPeak).toBeGreaterThan(0.01);
  // Three voices at a third of the level each cannot be louder than one full
  // voice, so a chord never clips where a single note does not.
  expect(chordPeak).toBeLessThanOrEqual(singlePeak * 1.05);
});

audioTest(
  'A note the browser cannot render is skipped, not silently mistuned',
  async () => {
    const engine = offlineEngine(0.8);
    await engine.preview([10, 30000, 440], 'sine', 1, 0.6, 0);
    const channel = (await engine.context.render()).getChannelData(0);

    expect(peak(channel, seconds(0.1), seconds(0.4))).toBeGreaterThan(0.01);
    expect(frequency(channel, RATE, seconds(0.1), seconds(0.4))).toBeCloseTo(
      440,
      0,
    );
  },
);

audioTest(
  'Exported audio decodes back to the samples that were written',
  async () => {
    const samples = new Float32Array(RATE * 0.25);
    for (let i = 0; i < samples.length; i++)
      samples[i] = Math.sin((2 * Math.PI * 440 * i) / RATE) * 0.5;

    const wav = encodeWav(samples, RATE);
    const context = new OfflineContext(1, RATE, RATE);
    const decoded = await context.decodeAudioData(wav);

    expect(decoded.sampleRate).toBe(RATE);
    expect(decoded.numberOfChannels).toBe(1);
    expect(decoded.length).toBe(samples.length);

    const channel = decoded.getChannelData(0);
    let worst = 0;
    for (let i = 0; i < samples.length; i++)
      worst = Math.max(worst, Math.abs(channel[i] - samples[i]));
    // 16-bit quantisation is the only difference the file format allows.
    expect(worst).toBeLessThan(1 / 32767 + 1e-6);
    expect(frequency(channel, RATE, 0, channel.length)).toBeCloseTo(440, 0);
  },
);

audioTest(
  'Exported audio keeps its rate at the edges of the supported range',
  async () => {
    for (const rate of [8000, 96000]) {
      const samples = new Float32Array(rate * 0.1);
      for (let i = 0; i < samples.length; i++)
        samples[i] = Math.sin((2 * Math.PI * 200 * i) / rate);

      const decoded = await new OfflineContext(1, rate, rate).decodeAudioData(
        encodeWav(samples, rate),
      );
      expect(decoded.sampleRate).toBe(rate);
      expect(decoded.length).toBe(samples.length);
      expect(decoded.duration).toBeCloseTo(0.1, 3);
    }
  },
);

audioTest(
  'Samples outside the representable range are clipped, never wrapped',
  async () => {
    const samples = new Float32Array([0, 0.5, -0.5, 2, -2]);
    const decoded = await new OfflineContext(1, 5, RATE).decodeAudioData(
      encodeWav(samples, RATE),
    );
    const channel = decoded.getChannelData(0);

    expect(channel[0]).toBeCloseTo(0, 4);
    expect(channel[1]).toBeCloseTo(0.5, 3);
    expect(channel[2]).toBeCloseTo(-0.5, 3);
    expect(channel[3]).toBeCloseTo(1, 3);
    expect(channel[4]).toBeCloseTo(-1, 3);
  },
);
