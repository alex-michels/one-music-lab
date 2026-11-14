import type { Wave } from './music';

/** How long a preview voice takes to rise from silence. */
const ATTACK_SECONDS = 0.02;
/** Time constant of the release of an interrupted voice. */
const RELEASE_CONSTANT = 0.012;
/** How long after the release begins the oscillator is stopped: well past it. */
const RELEASE_SECONDS = 0.08;

export class AudioEngine {
  context: AudioContext;
  private master: GainNode;
  private analyser: AnalyserNode;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  // Each preview voice with its own gain and the time it starts, so an
  // interrupted voice can be ended according to where it is in its envelope.
  private voices = new Map<OscillatorNode, { gain: GainNode; start: number }>();
  private data = new Uint8Array(2048);
  private generation = 0;
  constructor() {
    this.context = new AudioContext();
    this.master = this.context.createGain();
    this.master.gain.value = 0.063;
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.master.connect(this.analyser);
    this.analyser.connect(this.context.destination);
  }
  async start(frequency: number, wave: Wave, volume: number) {
    const generation = ++this.generation;
    await this.context.resume();
    if (generation !== this.generation) return false;
    this.stop();
    this.stopVoices();
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(volume * 0.35, now, 0.02);
    this.oscillator = this.context.createOscillator();
    this.gain = this.context.createGain();
    this.oscillator.type = wave;
    this.oscillator.frequency.value = Math.min(
      frequency,
      this.context.sampleRate / 2 - 1,
    );
    this.gain.gain.setValueAtTime(0, now);
    this.gain.gain.linearRampToValueAtTime(1, now + 0.025);
    this.oscillator.connect(this.gain);
    this.gain.connect(this.master);
    const oscillator = this.oscillator,
      gain = this.gain;
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start();
    return true;
  }
  update(frequency: number, wave: Wave, volume: number) {
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(volume * 0.35, now, 0.025);
    if (this.oscillator) {
      this.oscillator.frequency.setTargetAtTime(
        Math.min(frequency, this.context.sampleRate / 2 - 1),
        now,
        0.012,
      );
      this.oscillator.type = wave;
    }
  }
  stop() {
    if (!this.oscillator || !this.gain) return;
    const now = this.context.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setTargetAtTime(0, now, 0.012);
    this.oscillator.stop(now + 0.08);
    this.oscillator = null;
    this.gain = null;
  }
  async preview(
    frequencies: number[],
    wave: Wave,
    volume: number,
    duration = 0.65,
    spacing = 0,
  ) {
    const generation = ++this.generation;
    await this.context.resume();
    if (generation !== this.generation) return;
    this.stopVoices();
    this.master.gain.setTargetAtTime(
      volume * 0.35,
      this.context.currentTime,
      0.02,
    );
    frequencies.forEach((frequency, i) => {
      if (frequency < 20 || frequency >= this.context.sampleRate / 2) return;
      const osc = this.context.createOscillator(),
        gain = this.context.createGain(),
        start = this.context.currentTime + 0.01 + i * spacing;
      osc.type = wave;
      osc.frequency.value = frequency;
      const level = spacing ? 1 : 1 / frequencies.length;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(level, start + ATTACK_SECONDS);
      gain.gain.setTargetAtTime(0, start + duration - 0.09, 0.025);
      osc.connect(gain);
      gain.connect(this.master);
      this.voices.set(osc, { gain, start });
      osc.onended = () => {
        this.voices.delete(osc);
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(start);
      osc.stop(start + duration + 0.05);
    });
  }
  samples() {
    this.analyser.getByteTimeDomainData(this.data);
    return this.data;
  }
  /**
   * Ends every preview voice without a click and without a late blip.
   *
   * Stopping an oscillator in the middle of a cycle is a step in the signal,
   * and a step is heard as a click: every key pressed while the last note was
   * still sounding, every Escape and every change of page produced one. What a
   * voice needs depends on where it is in its own envelope:
   *
   * - **Not started yet** (a later note of a sequence): stopped at once, so it
   *   never sounds. Its envelope is left alone. Cancelling it would drop the
   *   scheduled "start from silence" and leave the gain at its default of 1,
   *   and a note due within the release time would then be heard at that level.
   * - **In its attack**: the rise is allowed to finish and the release starts
   *   from its end. Cancelling a ramp that is under way snaps the level back
   *   to where the ramp began, which is the very step this is here to avoid.
   * - **Sounding**: the scheduled decay is dropped and the level released over
   *   a few milliseconds, the same way the sustained tone ends.
   *
   * One engine refusing a call must not leave the other voices sounding.
   */
  private stopVoices() {
    const now = this.context.currentTime;
    this.voices.forEach(({ gain, start }, voice) => {
      try {
        if (start >= now) {
          voice.stop(now);
          return;
        }
        const from = Math.max(now, start + ATTACK_SECONDS + 0.001);
        gain.gain.cancelScheduledValues(from);
        gain.gain.setTargetAtTime(0, from, RELEASE_CONSTANT);
        voice.stop(from + RELEASE_SECONDS);
      } catch {}
    });
    this.voices.clear();
  }
  stopAll() {
    this.generation++;
    this.stop();
    this.stopVoices();
  }
  dispose() {
    this.stopAll();
    void this.context.close();
  }
}
