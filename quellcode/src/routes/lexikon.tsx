import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { NIVEAUS, REGELN, type Niveau } from "@/lib/komma";
import { useProgress } from "@/lib/store";
import { Card } from "@/components/ui3d";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lexikon")({
  head: () => ({ meta: [{ title: "Regel-Lexikon – Kommaheld" }, { name: "description", content: "Alle 7 Kommaregeln mit Signalwörtern, Beispielen und Ausnahmen – je nach Niveau erklärt." }, { property: "og:title", content: "Regel-Lexikon – Kommaheld" }, { property: "og:description", content: "Alle 7 Kommaregeln mit Signalwörtern, Beispielen und Ausnahmen – je nach Niveau erklärt." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Lexikon,
});

function Lexikon() {
  const { p, ready } = useProgress();
  const [n, setN] = useState<Niveau>(1);
  const [open, setOpen] = useState<number | null>(1);
  useEffect(() => { if (ready && p.niveau) setN(p.niveau); }, [ready, p.niveau]);
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">Regel-Lexikon</h1>
      <p className="text-muted-foreground">Wähle, wie ausführlich die Regeln erklärt werden.</p>
      <div className="mt-4 inline-flex rounded-2xl border-2 border-border bg-card p-1">
        {NIVEAUS.map((x) => (
          <button key={x.id} onClick={() => setN(x.id)} className={cn("rounded-xl px-3 py-2 text-sm font-extrabold", n === x.id ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}>{x.name}</button>
        ))}
      </div>
      <div className="mt-6 space-y-3">
        {REGELN.map((r) => (
          <Card key={r.nr} className="p-0">
            <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(open === r.nr ? null : r.nr)} aria-expanded={open === r.nr}>
              <span className="text-3xl">{r.emoji}</span>
              <span className="flex-1"><span className="text-xs font-extrabold uppercase text-muted-foreground">Regel {r.nr}</span><span className="block font-display text-lg font-bold">{r.titel}</span></span>
              <span className="text-xl text-muted-foreground">{open === r.nr ? "−" : "+"}</span>
            </button>
            {open === r.nr && (
              <div className="animate-rise space-y-4 border-t-2 border-border p-4">
                <p className="text-base leading-relaxed">{r.erklaerung[n]}</p>
                {n >= 2 && (
                  <div><div className="text-xs font-extrabold uppercase text-muted-foreground">Signalwörter</div>
                    <div className="mt-1 flex flex-wrap gap-2">{r.signal.map((s) => <span key={s} className="rounded-lg bg-accent px-2 py-1 text-sm font-bold text-accent-foreground">{s}</span>)}</div></div>
                )}
                <div><div className="text-xs font-extrabold uppercase text-muted-foreground">Beispiele</div>
                  <ul className="mt-1 space-y-1">{r.beispiele[n].map((b) => <li key={b} className="rounded-lg bg-muted px-3 py-2">{b.split(",").map((part, i, a) => <span key={i}>{part}{i < a.length - 1 && <b className="text-primary-deep">,</b>}</span>)}</li>)}</ul></div>
                {n === 3 && r.ausnahmen && (
                  <div><div className="text-xs font-extrabold uppercase text-destructive">Ausnahmen & Stolperfallen</div>
                    <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{r.ausnahmen.map((a) => <li key={a}>{a}</li>)}</ul>
                    <p className="mt-3 text-xs text-muted-foreground">Originalformulierung: {r.original}</p></div>
                )}
                <Link to="/ueben" search={{ regel: r.nr }} className="inline-block font-extrabold text-primary-deep">Diese Regel üben →</Link>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
