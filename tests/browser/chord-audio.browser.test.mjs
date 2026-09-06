import { expect, test } from 'vitest';
import { ChordPlayer } from '../../lib/chord-audio.ts';
import { planProgression } from '../../lib/chords.ts';

const Offline =
  globalThis.OfflineAudioContext ?? globalThis.webkitOfflineAudioContext;
const audioTest = Offline ? test : test.skip;
const RATE = 48000;
function player(seconds) {
  class RenderContext extends Offline {
    constructor() {
      super(1, Math.ceil(RATE * seconds), RATE);
    }
    resume() {
      return Promise.resolve();
    }
  }
  const original = globalThis.AudioContext;
  globalThis.AudioContext = RenderContext;
  try {
    return new ChordPlayer();
  } finally {
    globalThis.AudioContext = original;
  }
}
function rms(samples, from, to) {
  let sum = 0;
  for (let i = Math.round(from * RATE); i < Math.round(to * RATE); i++)
    sum += samples[i] ** 2;
  return Math.sqrt(sum / Math.round((to - from) * RATE));
}
function magnitude(samples, hz, from, to) {
  let real = 0,
    imaginary = 0,
    weightSum = 0;
  for (let i = Math.round(from * RATE); i < Math.round(to * RATE); i++) {
    // A Hann window distinguishes nearby E/E-flat without rectangular-window
    // leakage being mistaken for an actually sounding neighbouring pitch.
    const weight =
      0.5 - 0.5 * Math.cos((2 * Math.PI * (i / RATE - from)) / (to - from));
    weightSum += weight;
    real += weight * samples[i] * Math.cos((2 * Math.PI * hz * i) / RATE);
    imaginary += weight * samples[i] * Math.sin((2 * Math.PI * hz * i) / RATE);
  }
  return Math.hypot(real, imaginary) / weightSum;
}
const C = { tonic: 0, mode: 'major' };
const chord = (extra = {}) => ({
  degree: 0,
  quality: 'major',
  inversion: 0,
  beats: 1,
  ...extra,
});
audioTest(
  'A real C minor chord contains C/E-flat/G, stays bounded, and falls silent at the phrase end',
  async () => {
    const engine = player(1);
    await engine.play(
      planProgression(C, [chord({ quality: 'minor' })], 120, 'held', 1),
      1,
      'sine',
    );
    const samples = (await engine.context.startRendering()).getChannelData(0);
    expect(rms(samples, 0, 0.04)).toBe(0);
    for (const hz of [130.8128, 155.5635, 195.9977])
      expect(magnitude(samples, hz, 0.09, 0.35)).toBeGreaterThan(0.018);
    expect(magnitude(samples, 164.8138, 0.09, 0.35)).toBeLessThan(0.004);
    expect(Math.max(...samples)).toBeLessThan(0.23);
    expect(rms(samples, 0.6, 0.95)).toBe(0);
  },
);
audioTest(
  'Arpeggio pitches occur in order and chord changes follow the audio clock',
  async () => {
    const engine = player(1.5);
    const plan = planProgression(
      C,
      [chord({ beats: 2 }), chord({ degree: 4 })],
      180,
      'arpeggio',
      1,
    );
    await engine.play(plan, 1, 'sine');
    const samples = (await engine.context.startRendering()).getChannelData(0);
    for (const [midi, at] of [
      [48, 0.05],
      [52, 0.05 + 1 / 6],
      [55, 0.05 + 2 / 6],
      [48, 0.55],
      [55, 0.05 + 2 / 3],
    ]) {
      const hz = 440 * 2 ** ((midi - 69) / 12);
      expect(magnitude(samples, hz, at + 0.025, at + 0.1)).toBeGreaterThan(
        0.015,
      );
    }
    expect(rms(samples, 1.1, 1.4)).toBe(0);
  },
);
audioTest(
  'Stopping before playback cancels all scheduled notes, including later repeats',
  async () => {
    const engine = player(2);
    await engine.play(
      planProgression(C, [chord()], 200, 'pulse', 4),
      1,
      'triangle',
    );
    engine.stop();
    engine.stop();
    const samples = (await engine.context.startRendering()).getChannelData(0);
    expect(rms(samples, 0, 2)).toBe(0);
  },
);
audioTest(
  'Zero volume is silent and replacing a phrase removes the old pitches',
  async () => {
    const silent = player(1);
    await silent.play(
      planProgression(C, [chord()], 120, 'held', 1),
      0,
      'triangle',
    );
    expect(
      rms((await silent.context.startRendering()).getChannelData(0), 0, 1),
    ).toBe(0);
    const engine = player(1);
    const single = (midi) => ({
      events: [{ midi, at: 0, duration: 0.7, level: 1 }],
      starts: [0],
      duration: 0.8,
    });
    await engine.play(single(69), 1, 'sine');
    await engine.play(single(81), 1, 'sine');
    const samples = (await engine.context.startRendering()).getChannelData(0);
    expect(magnitude(samples, 880, 0.15, 0.45)).toBeGreaterThan(0.07);
    expect(magnitude(samples, 440, 0.15, 0.45)).toBeLessThan(0.001);
  },
);
