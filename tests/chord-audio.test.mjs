import { expect, test, vi } from 'vitest';
import { ChordPlayer } from '../lib/chord-audio.ts';

const phrase = () => ({
  events: [{ midi: 69, at: 0, duration: 0.5, level: 1 }],
  starts: [0],
  duration: 1,
});
function context(resume = () => Promise.resolve()) {
  const nodes = [];
  return {
    currentTime: 2,
    resume,
    close: vi.fn().mockResolvedValue(),
    nodes,
    createGain() {
      return {
        gain: { setValueAtTime() {}, linearRampToValueAtTime() {} },
        connect() {},
        disconnect() {},
      };
    },
    createOscillator() {
      const node = {
        frequency: {},
        connect() {},
        disconnect() {},
        start() {},
        stop() {},
        onended: null,
      };
      nodes.push(node);
      return node;
    },
  };
}
test('Invalid phrases fail before the audio context is resumed, including nonfinite data and event bounds', async () => {
  const ctx = context(vi.fn().mockResolvedValue());
  const player = new ChordPlayer(ctx);
  for (const volume of [-0.1, 1.1, NaN, Infinity])
    await expect(player.play(phrase(), volume, 'sine')).rejects.toThrow(
      RangeError,
    );
  await expect(player.play(phrase(), 0.5, 'square')).rejects.toThrow(
    RangeError,
  );
  for (const duration of [0, -1, 180.1, NaN, Infinity])
    await expect(
      player.play({ ...phrase(), duration }, 0.5, 'sine'),
    ).rejects.toThrow(RangeError);
  for (const events of [
    [],
    Array.from({ length: 5121 }, () => phrase().events[0]),
  ])
    await expect(
      player.play({ ...phrase(), events }, 0.5, 'sine'),
    ).rejects.toThrow(RangeError);
  for (const bad of [
    { midi: 23 },
    { midi: 109 },
    { midi: 60.5 },
    { midi: NaN },
    { at: -0.1 },
    { at: NaN },
    { duration: 0.019 },
    { duration: NaN },
    { at: 0.9, duration: 0.2 },
    { level: 0 },
    { level: 1.1 },
    { level: NaN },
  ])
    await expect(
      player.play(
        { ...phrase(), events: [{ ...phrase().events[0], ...bad }] },
        0.5,
        'sine',
      ),
    ).rejects.toThrow(RangeError);
  expect(ctx.resume).not.toHaveBeenCalled();
});
test('Stop, replacement and disposal during a suspended-context resume cannot start stale sound', async () => {
  const resolvers = [];
  const ctx = context(() => new Promise((resolve) => resolvers.push(resolve)));
  const player = new ChordPlayer(ctx);
  const first = player.play(phrase(), 0.5, 'sine');
  player.stop();
  resolvers.shift()();
  expect(await first).toBeNull();
  expect(ctx.nodes).toHaveLength(0);
  const old = player.play(phrase(), 0.5, 'sine');
  const next = player.play(phrase(), 0.5, 'triangle');
  resolvers.shift()();
  resolvers.shift()();
  expect(await old).toBeNull();
  expect(await next).toBe(2.05);
  expect(ctx.nodes).toHaveLength(1);
  const last = player.play(phrase(), 0.5, 'sine');
  player.dispose();
  resolvers.shift()();
  expect(await last).toBeNull();
  expect(ctx.close).toHaveBeenCalledOnce();
});
test('Rejected resume and graph creation errors propagate; another gesture can retry', async () => {
  const ctx = context(
    vi.fn().mockRejectedValueOnce(new Error('blocked')).mockResolvedValue(),
  );
  const player = new ChordPlayer(ctx);
  await expect(player.play(phrase(), 0, 'sine')).rejects.toThrow('blocked');
  const original = ctx.createOscillator.bind(ctx);
  ctx.createOscillator = vi
    .fn()
    .mockImplementationOnce(original)
    .mockImplementationOnce(() => {
      throw new Error('resources');
    });
  const plan = {
    ...phrase(),
    events: [...phrase().events, ...phrase().events],
  };
  await expect(player.play(plan, 1, 'triangle')).rejects.toThrow('resources');
  ctx.createOscillator = original;
  expect(await player.play(phrase(), 1, 'sine')).toBe(2.05);
  // An old ended event cannot disconnect a new phrase.
  ctx.nodes[0].onended();
  ctx.nodes[1].onended();
  ctx.close.mockRejectedValue(new Error('already closed'));
  player.dispose();
  await Promise.resolve();
});
