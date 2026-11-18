import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, Download, Lock } from "lucide-react";
import { encodeQuiz, NIVEAUS, REGELN, rangFuer, type Niveau, type QuizPayload } from "@/lib/komma";
import { useProgress } from "@/lib/store";
import { Btn, Card } from "@/components/ui3d";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lehrer")({
  head: () => ({ meta: [{ title: "Lehrer-Bereich – Kommaheld" }, { name: "description", content: "Klassenübersicht, Fehlerquoten pro Regel, CSV-Export und teilbare Übungslinks." }, { property: "og:title", content: "Lehrer-Bereich – Kommaheld" }, { property: "og:description", content: "Klassenübersicht, Fehlerquoten pro Regel, CSV-Export und teilbare Übungslinks." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Lehrer,
});

const PIN = "1234";

type Schueler = { name: string; xp: number; saetze: number; quote: number; perRule: number[]; echt?: boolean };

function demoKlasse(): Schueler[] {
  const namen = ["Ali K.", "Ben S.", "Carla M.", "David R.", "Elif Y.", "Finn B.", "Greta H.", "Hannes W.", "Ida L.", "Jonas P.", "Kim T.", "Lara F.", "Max N.", "Nora G.", "Omar A.", "Paula Z.", "Quentin D.", "Rosa V.", "Sami E.", "Tara O.", "Uwe J.", "Vivien C."];
  let seed = 42; const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const schwer = [0.15, 0.3, 0.2, 0.25, 0.55, 0.25, 0.45];
  return namen.map((name) => {
    const perRule = schwer.map((s) => Math.round(Math.min(95, Math.max(2, (s + (r() - 0.5) * 0.4) * 100))));
    const saetze = Math.round(20 + r() * 200);
    return { name, perRule, saetze, xp: Math.round(saetze * (8 + r() * 12)), quote: 100 - Math.round(perRule.reduce((a, b) => a + b) / 7) };
  });
}

function Lehrer() {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  const [fehler, setFehler] = useState(false);
  useEffect(() => { if (sessionStorage.getItem("kommaheld-lehrer") === "1") setOk(true); }, []);
  if (!ok) return (
    <div className="mx-auto max-w-sm text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-secondary-foreground"><Lock /></div>
      <h1 className="mt-4 text-3xl font-bold">Lehrer-Bereich</h1>
      <p className="text-sm text-muted-foreground">Bitte PIN eingeben. <span className="font-bold">(Test-PIN: 1234)</span></p>
      <form className="mt-5 space-y-3" onSubmit={(e) => { e.preventDefault(); if (pin === PIN) { sessionStorage.setItem("kommaheld-lehrer", "1"); setOk(true); } else { setFehler(true); setPin(""); } }}>
        <input type="password" inputMode="numeric" value={pin} onChange={(e) => { setPin(e.target.value); setFehler(false); }} aria-label="PIN"
          className={cn("w-full rounded-xl border-2 bg-card px-4 py-3 text-center text-2xl tracking-[0.5em]", fehler ? "animate-shake border-destructive" : "border-input")} />
        {fehler && <p className="text-sm font-bold text-destructive">Falsche PIN</p>}
        <Btn variant="secondary" className="w-full">Entsperren</Btn>
      </form>
    </div>
  );
  return <Dashboard />;
}

function Dashboard() {
  const { p } = useProgress();
  const klasse = useMemo(() => {
    const k = demoKlasse();
    if (p.total) k.unshift({ name: (p.name || "Du") + " (dieses Gerät)", xp: p.xp, saetze: p.total, quote: Math.round((p.correct / p.total) * 100), echt: true,
      perRule: REGELN.map((r) => { const s = p.perRule[r.nr]; return s ? Math.round((s.e / s.a) * 100) : 0; }) });
    return k;
  }, [p]);
  const avg = REGELN.map((_, i) => Math.round(klasse.reduce((a, s) => a + s.perRule[i]!, 0) / klasse.length));
  const problem = klasse.length ? avg.indexOf(Math.max(...avg)) : 0;
  const betroffen = Math.round((klasse.filter((s) => s.perRule[problem]! >= 40).length / klasse.length) * 100);

  const csv = () => {
    const head = ["Name", "XP", "Rang", "Sätze", "Trefferquote %", ...REGELN.map((r) => `Fehler R${r.nr} %`)];
    const rows = klasse.map((s) => [s.name, s.xp, rangFuer(s.xp).titel, s.saetze, s.quote, ...s.perRule]);
    const txt = "\uFEFF" + [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
    a.download = "klassenuebersicht.csv"; a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-3xl font-bold">Klassen-Übersicht</h1>
          <p className="text-sm text-muted-foreground">Demo-Klasse 8b · Ohne Datenbank sieht jedes Gerät nur die eigenen echten Daten; die übrigen Schüler sind Beispieldaten.</p></div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={csv}><Download size={16} className="mr-1 inline" />CSV</Btn>
          <Btn variant="ghost" onClick={() => { sessionStorage.removeItem("kommaheld-lehrer"); location.reload(); }}>Sperren</Btn>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="text-xs font-extrabold uppercase text-muted-foreground">Schüler</div><div className="text-3xl font-bold">{klasse.length}</div></Card>
        <Card><div className="text-xs font-extrabold uppercase text-muted-foreground">Ø Trefferquote</div><div className="text-3xl font-bold">{Math.round(klasse.reduce((a, s) => a + s.quote, 0) / klasse.length)}%</div></Card>
        <Card className="border-destructive bg-destructive/10"><div className="text-xs font-extrabold uppercase text-destructive">Größte Baustelle</div>
          <div className="font-bold">{betroffen}% der Klasse haben Probleme bei Regel {problem + 1}: {REGELN[problem]!.titel}</div></Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold">Fehlerquote pro Regel</h2>
        <div className="mt-4 space-y-3">
          {REGELN.map((r, i) => (
            <div key={r.nr} className="flex items-center gap-3 text-sm">
              <span className="w-44 shrink-0 font-bold sm:w-64">{r.emoji} R{r.nr}: {r.titel}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", avg[i]! >= 40 ? "bg-destructive" : avg[i]! >= 25 ? "bg-gold" : "bg-primary")} style={{ width: avg[i] + "%" }} />
              </div>
              <span className="w-12 text-right font-extrabold">{avg[i]}%</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="border-b-2 border-border text-left text-xs uppercase text-muted-foreground">
            <th className="p-3">Name</th><th>XP</th><th>Sätze</th><th>Quote</th>{REGELN.map((r) => <th key={r.nr} className="text-center">R{r.nr}</th>)}</tr></thead>
          <tbody>{klasse.map((s) => (
            <tr key={s.name} className={cn("border-b border-border", s.echt && "bg-accent")}>
              <td className="p-3 font-bold">{s.name}</td><td>{s.xp}</td><td>{s.saetze}</td><td>{s.quote}%</td>
              {s.perRule.map((v, i) => <td key={i} className="text-center"><span className={cn("rounded px-1.5 py-0.5 text-xs font-bold", v >= 40 ? "bg-destructive/15 text-destructive" : v >= 25 ? "bg-gold/30" : "bg-accent text-accent-foreground")}>{v}%</span></td>)}
            </tr>))}</tbody>
        </table>
      </Card>

      <Generator />
    </div>
  );
}

function Generator() {
  const [modus, setModus] = useState<"eigene" | "regeln">("regeln");
  const [titel, setTitel] = useState("");
  const [text, setText] = useState("Ich glaube, dass es heute regnet.\nWir kaufen Äpfel, Birnen und Bananen.");
  const [regeln, setRegeln] = useState<number[]>([5, 7]);
  const [niveau, setNiveau] = useState<Niveau>(2);
  const [anzahl, setAnzahl] = useState(10);
  const [link, setLink] = useState("");
  const [kopiert, setKopiert] = useState(false);

  const erzeugen = () => {
    const q: QuizPayload = modus === "eigene"
      ? { t: titel, s: text.split("\n").map((x) => x.trim()).filter(Boolean).map((x) => ({ x })) }
      : { t: titel, r: regeln, l: niveau, n: anzahl };
    setLink(`${location.origin}/ueben?quiz=${encodeQuiz(q)}`); setKopiert(false);
  };

  return (
    <Card>
      <h2 className="text-xl font-bold">Aufgaben- & Link-Generator</h2>
      <p className="text-sm text-muted-foreground">Erstelle eine Übung und teile den Link – Schüler öffnen sie direkt, ohne Anmeldung.</p>
      <div className="mt-4 inline-flex rounded-2xl border-2 border-border p-1">
        {(["regeln", "eigene"] as const).map((m) => (
          <button key={m} onClick={() => setModus(m)} className={cn("rounded-xl px-3 py-2 text-sm font-extrabold", modus === m ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")}>
            {m === "regeln" ? "Regeln & Niveau" : "Eigene Sätze"}</button>
        ))}
      </div>
      <div className="mt-4 space-y-4">
        <input placeholder="Titel der Übung (z. B. Hausaufgabe 12.11.)" value={titel} onChange={(e) => setTitel(e.target.value)} className="w-full rounded-xl border-2 border-input bg-background px-3 py-2" />
        {modus === "eigene" ? (
          <div><label className="text-sm font-bold" htmlFor="saetze">Sätze mit korrekt gesetzten Kommas (ein Satz pro Zeile)</label>
            <textarea id="saetze" rows={6} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 w-full rounded-xl border-2 border-input bg-background px-3 py-2" /></div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {REGELN.map((r) => (
                <button key={r.nr} onClick={() => setRegeln((x) => x.includes(r.nr) ? x.filter((y) => y !== r.nr) : [...x, r.nr])}
                  className={cn("rounded-xl border-2 px-3 py-2 text-sm font-bold", regeln.includes(r.nr) ? "border-primary bg-accent text-accent-foreground" : "border-border")}>
                  {r.emoji} R{r.nr}: {r.titel}</button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select value={niveau} onChange={(e) => setNiveau(Number(e.target.value) as Niveau)} className="rounded-xl border-2 border-input bg-background px-3 py-2 font-bold" aria-label="Niveau">
                {NIVEAUS.map((n) => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
              <label className="text-sm font-bold">Anzahl <input type="number" min={3} max={30} value={anzahl} onChange={(e) => setAnzahl(Number(e.target.value))} className="ml-1 w-20 rounded-xl border-2 border-input bg-background px-2 py-2" /></label>
            </div>
          </>
        )}
        <Btn onClick={erzeugen} disabled={modus === "regeln" && !regeln.length}>Link erzeugen</Btn>
        {link && (
          <div className="flex animate-rise flex-col gap-2 rounded-xl bg-muted p-3 sm:flex-row sm:items-center">
            <code className="flex-1 break-all text-xs">{link}</code>
            <div className="flex gap-2">
              <Btn variant="ghost" className="py-2" onClick={() => { navigator.clipboard.writeText(link); setKopiert(true); }}><Copy size={14} className="mr-1 inline" />{kopiert ? "Kopiert!" : "Kopieren"}</Btn>
              <a href={link} target="_blank" rel="noreferrer"><Btn variant="secondary" className="py-2">Testen</Btn></a>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
