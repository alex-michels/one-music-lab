import type { Wave } from './music';
export class AudioEngine {
  context: AudioContext;
  private master: GainNode;
  private analyser: AnalyserNode;
  private oscillator: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private voices = new Set<OscillatorNode>();
  private data = new Uint8Array(2048);
  private generation = 0;
  constructor() { this.context = new AudioContext(); this.master = this.context.createGain(); this.master.gain.value = .063; this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 2048; this.master.connect(this.analyser); this.analyser.connect(this.context.destination); }
  async start(frequency: number, wave: Wave, volume: number) {
    const generation = ++this.generation; await this.context.resume(); if (generation !== this.generation) return false;
    this.stop(); this.stopVoices(); const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(volume * .35, now, .02);
    this.oscillator = this.context.createOscillator(); this.gain = this.context.createGain(); this.oscillator.type = wave;
    this.oscillator.frequency.value = Math.min(frequency, this.context.sampleRate / 2 - 1);
    this.gain.gain.setValueAtTime(0, now); this.gain.gain.linearRampToValueAtTime(1, now + .025);
    this.oscillator.connect(this.gain); this.gain.connect(this.master);
    const oscillator = this.oscillator, gain = this.gain;
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); }; oscillator.start(); return true;
  }
  update(frequency: number, wave: Wave, volume: number) { const now = this.context.currentTime; this.master.gain.setTargetAtTime(volume * .35, now, .025); if (this.oscillator) { this.oscillator.frequency.setTargetAtTime(Math.min(frequency, this.context.sampleRate / 2 - 1), now, .012); this.oscillator.type = wave; } }
  stop() { if (!this.oscillator || !this.gain) return; const now = this.context.currentTime; this.gain.gain.cancelScheduledValues(now); this.gain.gain.setTargetAtTime(0, now, .012); this.oscillator.stop(now + .08); this.oscillator = null; this.gain = null; }
  async preview(frequencies: number[], wave: Wave, volume: number, duration = .65, spacing = 0) {
    const generation = ++this.generation; await this.context.resume(); if (generation !== this.generation) return;
    this.stopVoices(); this.master.gain.setTargetAtTime(volume * .35, this.context.currentTime, .02);
    frequencies.forEach((frequency, i) => { if (frequency < 20 || frequency >= this.context.sampleRate / 2) return;
      const osc = this.context.createOscillator(), gain = this.context.createGain(), start = this.context.currentTime + .01 + i * spacing;
      osc.type = wave; osc.frequency.value = frequency;
      const level = spacing ? 1 : 1 / frequencies.length;
      gain.gain.setValueAtTime(0, start); gain.gain.linearRampToValueAtTime(level, start + .02); gain.gain.setTargetAtTime(0, start + duration - .09, .025);
      osc.connect(gain); gain.connect(this.master); this.voices.add(osc);
      osc.onended = () => { this.voices.delete(osc); osc.disconnect(); gain.disconnect(); };
      osc.start(start); osc.stop(start + duration + .05);
    });
  }
  samples() { this.analyser.getByteTimeDomainData(this.data); return this.data; }
  private stopVoices() { this.voices.forEach(voice => { try { voice.stop(); } catch {} }); this.voices.clear(); }
  stopAll() { this.generation++; this.stop(); this.stopVoices(); }
  dispose() { this.stopAll(); void this.context.close(); }
}
