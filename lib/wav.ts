import type { Wave } from './music';
export function encodeWav(samples: Float32Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + samples.length * 2),
    view = new DataView(buffer);
  const text = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++)
      view.setUint8(offset + i, value.charCodeAt(i));
  };
  text(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  samples.forEach((sample, i) => {
    const v = Math.max(-1, Math.min(1, sample));
    view.setInt16(44 + i * 2, Math.round(v * (v < 0 ? 32768 : 32767)), true);
  });
  return buffer;
}
export async function exportTone(
  frequency: number,
  wave: Wave,
  volume: number,
) {
  const sampleRate = 48000,
    duration = 5,
    ctx = new OfflineAudioContext(1, sampleRate * duration, sampleRate),
    osc = ctx.createOscillator(),
    gain = ctx.createGain();
  osc.type = wave;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, 0);
  gain.gain.linearRampToValueAtTime(volume * 0.35, 0.025);
  gain.gain.setValueAtTime(volume * 0.35, duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(duration);
  const result = await ctx.startRendering();
  const url = URL.createObjectURL(
    new Blob([encodeWav(result.getChannelData(0), sampleRate)], {
      type: 'audio/wav',
    }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `oml-${frequency.toFixed(2)}Hz-${wave}.wav`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
