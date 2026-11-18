import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { regelByNr, tokenize, type Niveau, type Satz, spielerLevel } from "@/lib/komma";
import { BADGES, recordAnswer, setProgress } from "@/lib/store";
import { play } from "@/lib/sound";
import { Bar, Btn } from "./ui3d";
import { cn } from "@/lib/utils";

type Result = { richtig: boolean; fehlend: number[]; zuviel: number[] };

export function Trainer({ saetze, niveau, titel, onDone, record = true }: {
  saetze: Satz[]; niveau: Niveau; titel?: string | undefined; onDone?: (score: { richtig: number; total: number; byNiveau: Record<number, number> }) => void; record?: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [gesetzt, setGesetzt] = useState<Set<number>>(new Set());
  const [result, setResult] = useState<Result | null>(null);
  const [focus, setFocus] = useState(0);
  const [stats, setStats] = useState({ richtig: 0, xp: 0, byNiveau: {} as Record<number, number> });
  const [toast, setToast] = useState<string | null>(null);
  const [fertig, setFertig] = useState(false);
  const satz = saetze[idx]!;
  const { words, commas } = useMemo(() => tokenize(satz?.text ?? ""), [satz]);
  const ref = useRef<HTMLDivElement>(null);

  const toggle = useCallback((i: number) => {
    if (result) return;
    play("tap");
    setGesetzt((g) => { const n = new Set(g); n.has(i) ? n.delete(i) : n.add(i); return n; });
    setFocus(i);
  }, [result]);

  const pruefen = useCallback(() => {
    const fehlend = [...commas].filter((c) => !gesetzt.has(c));
    const zuviel = [...gesetzt].filter((c) => !commas.has(c));
    const richtig = !fehlend.length && !zuviel.length;
    setResult({ richtig, fehlend, zuviel });
    play(richtig ? "right" : "wrong");
    if (record) {
      const before = spielerLevel(JSON.parse(localStorage.getItem("kommaheld-progress-v1") || "{}").xp ?? 0);
      const r = recordAnswer(satz.regel, richtig, niveau);
      const after = spielerLevel(JSON.parse(localStorage.getItem("kommaheld-progress-v1") || "{}").xp ?? 0);
      setStats((s) => ({ ...s, xp: s.xp + r.xp }));
      if (after > before) { setTimeout(() => play("levelup"), 300); setToast(`Level-Aufstieg! Du bist jetzt Level ${after} 🎉`); }
      else if (r.neu.length) setToast(`Neues Abzeichen: ${r.neu.map((b) => BADGES[b]!.emoji + " " + BADGES[b]!.name).join(", ")}`);
    }
    if (richtig) setStats((s) => ({ ...s, richtig: s.richtig + 1, byNiveau: { ...s.byNiveau, [satz.niveau]: ((s.byNiveau[satz.niveau] as number | undefined) ?? 0) + 1 } }));
  }, [commas, gesetzt, satz, niveau, record]);

  const weiter = useCallback(() => {
    setToast(null);
    if (idx + 1 >= saetze.length) {
      setFertig(true);
      onDone?.({ richtig: stats.richtig, total: saetze.length, byNiveau: stats.byNiveau });
      return;
    }
    setIdx(idx + 1); setGesetzt(new Set()); setResult(null); setFocus(0);
  }, [idx, saetze.length, onDone, stats]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      if (fertig) return;
      if (e.key === "ArrowRight") { setFocus((f) => Math.min(words.length - 2, f + 1)); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { setFocus((f) => Math.max(0, f - 1)); e.preventDefault(); }
      else if (e.key === "," || e.key === " ") { toggle(focus); e.preventDefault(); }
      else if (e.key === "Enter") { result ? weiter() : pruefen(); e.preventDefault(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [focus, toggle, pruefen, weiter, result, words.length, fertig]);

  if (!saetze.length) return <p>Keine Sätze gefunden.</p>;

  if (fertig) {
    const pct = Math.round((stats.richtig / saetze.length) * 100);
    return (
      <div className="mx-auto max-w-md animate-rise text-center">
        <div className="animate-pop text-7xl">{pct >= 80 ? "🏆" : pct >= 50 ? "💪" : "🌱"}</div>
        <h2 className="mt-4 text-3xl font-bold">Lektion geschafft!</h2>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border-2 border-gold p-4"><div className="text-xs font-extrabold uppercase text-gold-deep">XP</div><div className="text-3xl font-bold">+{stats.xp}</div></div>
          <div className="rounded-2xl border-2 border-primary p-4"><div className="text-xs font-extrabold uppercase text-primary-deep">Richtig</div><div className="text-3xl font-bold">{pct}%</div></div>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <Btn onClick={() => location.reload()}>Nochmal</Btn>
          <Link to="/"><Btn variant="ghost">Zur Übersicht</Btn></Link>
        </div>
      </div>
    );
  }

  const regel = satz.regel ? regelByNr(satz.regel) : null;
  const correctSet = commas;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link to="/" aria-label="Beenden" className="text-muted-foreground"><X /></Link>
        <Bar value={((idx + (result ? 1 : 0)) / saetze.length) * 100} />
        <span className="text-sm font-extrabold text-muted-foreground">{idx + 1}/{saetze.length}</span>
      </div>
      {titel && <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-secondary-deep">{titel}</p>}
      <h2 className="text-2xl font-bold">Setze die fehlenden Kommas</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tippe zwischen die Wörter. Manchmal ist kein Komma richtig! · Tastatur: ← → , Leertaste/Komma, Enter</p>

      <div ref={ref} className={cn("mt-8 flex flex-wrap items-center gap-y-3 rounded-2xl border-2 border-border bg-card p-5 text-xl leading-relaxed sm:text-2xl", result && !result.richtig && "animate-shake")}>
        {words.map((w, i) => {
          const isLast = i === words.length - 1;
          const set = gesetzt.has(i);
          let state: "none" | "set" | "ok" | "miss" | "extra" = set ? "set" : "none";
          if (result) {
            if (set && correctSet.has(i)) state = "ok";
            else if (set) state = "extra";
            else if (correctSet.has(i)) state = "miss";
          }
          return (
            <span key={i} className="flex items-center">
              <span className="font-semibold">{w}</span>
              {!isLast && (
                <button onClick={() => toggle(i)} aria-label={`Komma nach „${w}“`}
                  className={cn("mx-0.5 grid h-10 min-w-6 place-items-center rounded-lg px-1 font-black transition-colors",
                    state === "none" && "text-transparent hover:bg-accent hover:text-primary/40",
                    state === "set" && "text-secondary-deep bg-secondary/15",
                    state === "ok" && "text-primary-deep bg-accent",
                    state === "miss" && "text-destructive bg-destructive/15 animate-pop",
                    state === "extra" && "text-destructive line-through bg-destructive/10",
                    focus === i && !result && "ring-2 ring-secondary")}>
                  ,
                </button>
              )}
            </span>
          );
        })}
      </div>

      {toast && <div className="mt-4 animate-pop rounded-2xl bg-gold/30 p-3 text-center font-extrabold">{toast}</div>}

      <div className={cn("fixed inset-x-0 bottom-16 z-20 border-t-2 p-4 md:bottom-0", !result ? "border-border bg-background" : result.richtig ? "border-primary bg-accent" : "border-destructive bg-destructive/10")}>
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            {result && (
              <div className="animate-rise">
                <p className={cn("font-display text-xl font-bold", result.richtig ? "text-primary-deep" : "text-destructive")}>
                  {result.richtig ? "Super, alles richtig! 🎉" : "Nicht ganz …"}
                </p>
                {!result.richtig && (
                  <p className="text-sm">
                    {result.fehlend.length > 0 && <>Fehlt nach: <b>{result.fehlend.map((i) => words[i]).join(", ")}</b>. </>}
                    {result.zuviel.length > 0 && <>Zu viel nach: <b>{result.zuviel.map((i) => words[i]).join(", ")}</b>. </>}
                  </p>
                )}
                <p className="mt-1 text-sm"><b>Lösung:</b> {satz.text}</p>
                {regel && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <b>Regel {regel.nr} – {regel.titel}:</b> {regel.erklaerung[niveau]}
                  </p>
                )}
              </div>
            )}
          </div>
          {!result ? <Btn onClick={pruefen} className="sm:min-w-40">Prüfen</Btn>
            : <Btn variant={result.richtig ? "primary" : "danger"} onClick={weiter} className="sm:min-w-40">Weiter</Btn>}
        </div>
      </div>
      <div className="h-56" />
    </div>
  );
}

export function useSetNiveau() {
  return (n: Niveau) => setProgress((p) => ({ ...p, niveau: n }));
}
