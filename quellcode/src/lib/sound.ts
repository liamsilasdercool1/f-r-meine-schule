let ctx: AudioContext | null = null;
export function play(kind: "tap" | "right" | "wrong" | "levelup") {
  if (typeof window === "undefined" || localStorage.getItem("kommaheld-mute") === "1") return;
  try {
    ctx = ctx ?? new AudioContext();
    const seq: Record<string, [number, number][]> = {
      tap: [[660, 0.05]],
      right: [[660, 0.09], [990, 0.16]],
      wrong: [[220, 0.12], [180, 0.2]],
      levelup: [[523, 0.1], [659, 0.1], [784, 0.1], [1046, 0.25]],
    };
    let t = ctx.currentTime;
    for (const [f, d] of seq[kind]!) {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = kind === "wrong" ? "sawtooth" : "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d); t += d * 0.9;
    }
  } catch { /* ignore */ }
}
