import { MAX_MIDI, MIN_MIDI, type ProgressionPlan } from './chords';

export type ChordTone = 'sine' | 'triangle';

/** Schedules a finite phrase on the audio clock, never a chain of JS note timers. */
export class ChordPlayer {
  readonly context: AudioContext;
  private generation = 0;
  private voices = new Set<OscillatorNode>();
  private master: GainNode | null = null;
  constructor(context = new AudioContext()) {
    this.context = context;
  }
  async play(plan: ProgressionPlan, volume: number, tone: ChordTone) {
    this.stop();
    if (
      !Number.isFinite(volume) ||
      volume < 0 ||
      volume > 1 ||
      !['sine', 'triangle'].includes(tone) ||
      !Number.isFinite(plan.duration) ||
      plan.duration <= 0 ||
      plan.duration > 180 ||
      plan.events.length < 1 ||
      plan.events.length > 5120
    )
      throw new RangeError('Invalid audio phrase');
    for (const event of plan.events) {
      if (
        !Number.isInteger(event.midi) ||
        event.midi < MIN_MIDI ||
        event.midi > MAX_MIDI ||
        !Number.isFinite(event.at) ||
        event.at < 0 ||
        !Number.isFinite(event.duration) ||
        event.duration < 0.02 ||
        event.at + event.duration > plan.duration ||
        !Number.isFinite(event.level) ||
        event.level <= 0 ||
        event.level > 1
      )
        throw new RangeError('Invalid audio note');
    }
    const generation = this.generation;
    await this.context.resume();
    if (generation !== this.generation) return null;
    const origin = this.context.currentTime + 0.05;
    const master = this.context.createGain();
    master.gain.value = volume * 0.22;
    master.connect(this.context.destination);
    this.master = master;
    try {
      for (const event of plan.events) {
        const oscillator = this.context.createOscillator();
        const envelope = this.context.createGain();
        const start = origin + event.at,
          end = start + event.duration;
        oscillator.type = tone;
        oscillator.frequency.value = 440 * 2 ** ((event.midi - 69) / 12);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(
          event.level,
          start + Math.min(0.012, event.duration / 4),
        );
        envelope.gain.setValueAtTime(
          event.level * 0.7,
          end - Math.min(0.06, event.duration / 3),
        );
        envelope.gain.linearRampToValueAtTime(0, end);
        oscillator.connect(envelope);
        envelope.connect(master);
        this.voices.add(oscillator);
        oscillator.onended = () => {
          this.voices.delete(oscillator);
          oscillator.disconnect();
          envelope.disconnect();
          if (this.voices.size === 0 && this.master === master) {
            master.disconnect();
            this.master = null;
          }
        };
        oscillator.start(start);
        oscillator.stop(end);
      }
    } catch (error) {
      this.stop();
      throw error;
    }
    return origin;
  }
  stop() {
    this.generation++;
    // Cancel future onsets immediately; disconnecting the master also makes
    // stop deterministic for a context suspended before playback starts.
    this.master?.disconnect();
    this.master = null;
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
  }
  dispose() {
    this.stop();
    void this.context.close().catch(() => {});
  }
}
