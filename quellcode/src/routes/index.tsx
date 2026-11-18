import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress, BADGES } from "@/lib/store";
import { NIVEAUS, REGELN, rangFuer, spielerLevel, xpFuerLevel } from "@/lib/komma";
import { Bar, Btn, Card } from "@/components/ui3d";
import { useSetNiveau } from "@/components/Trainer";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Kommaheld – Kommaregeln spielerisch lernen" }, { name: "description", content: "Lerne die 7 deutschen Kommaregeln mit Komma-Trainer, Lexikon, XP, Streaks und Rangliste." }, { property: "og:title", content: "Kommaheld – Kommaregeln spielerisch lernen" }, { property: "og:description", content: "Lerne die 7 deutschen Kommaregeln mit Komma-Trainer, Lexikon, XP, Streaks und Rangliste." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Home,
});

function Home() {
  const { p, ready } = useProgress();
  const setNiveau = useSetNiveau();
  if (!ready) return null;
  const lvl = spielerLevel(p.xp);
  const rang = rangFuer(p.xp);
  const lvlPct = ((p.xp - xpFuerLevel(lvl)) / (xpFuerLevel(lvl + 1) - xpFuerLevel(lvl))) * 100;

  if (!p.niveau) {
    return (
      <div className="mx-auto max-w-2xl animate-rise py-6 text-center">
        <div className="text-7xl">✍️</div>
        <h1 className="mt-4 text-4xl font-bold">Werde zum Kommahelden!</h1>
        <p className="mt-2 text-muted-foreground">7 Regeln, 3 Niveaus, über 350 Übungssätze. Wo möchtest du starten?</p>
        <div className="mt-8 grid gap-3 text-left">
          {NIVEAUS.map((n) => (
            <button key={n.id} onClick={() => setNiveau(n.id)}
              className="rounded-2xl border-2 border-border bg-card p-4 shadow-[0_4px_0_var(--border)] transition hover:border-primary">
              <div className="font-display text-xl font-bold">{"⭐".repeat(n.id)} {n.name}</div>
              <div className="text-sm text-muted-foreground">{n.desc}</div>
            </button>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">Unsicher?</p>
        <Link to="/einstufung"><Btn variant="secondary" className="mt-2">Einstufungstest machen</Btn></Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="space-y-5 md:col-span-2">
        <Card className="animate-rise">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{rang.emoji}</div>
            <div className="flex-1">
              <div className="text-sm font-extrabold uppercase text-muted-foreground">Level {lvl} · {rang.titel}</div>
              <Bar value={lvlPct} className="mt-2" />
              <div className="mt-1 text-xs text-muted-foreground">{p.xp} / {xpFuerLevel(lvl + 1)} XP bis Level {lvl + 1}</div>
            </div>
          </div>
          <Link to="/ueben" search={{}}><Btn className="mt-5 w-full py-4 text-base">Jetzt üben</Btn></Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">Dein Niveau</h2>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {NIVEAUS.map((n) => (
              <button key={n.id} onClick={() => setNiveau(n.id)}
                className={cn("rounded-xl border-2 p-3 text-sm font-extrabold", p.niveau === n.id ? "border-secondary bg-secondary/15 text-secondary-deep" : "border-border")}>
                {"⭐".repeat(n.id)}<br />{n.name}
              </button>
            ))}
          </div>
          <Link to="/einstufung" className="mt-3 inline-block text-sm font-bold text-secondary-deep">Einstufungstest wiederholen →</Link>
        </Card>
        <Card>
          <h2 className="text-xl font-bold">Regeln gezielt üben</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REGELN.map((r) => {
              const st = p.perRule[r.nr];
              const q = st ? Math.round(((st.a - st.e) / st.a) * 100) : null;
              return (
                <Link key={r.nr} to="/ueben" search={{ regel: r.nr }} className="flex items-center gap-3 rounded-xl border-2 border-border p-3 hover:border-primary">
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="flex-1 text-sm font-bold">Regel {r.nr}: {r.titel}</span>
                  <span className="text-xs font-extrabold text-muted-foreground">{q === null ? "neu" : q + "%"}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
      <div className="space-y-5">
        <Card>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div><div className="text-3xl">🔥</div><div className="text-2xl font-bold">{p.streak}</div><div className="text-xs font-bold text-muted-foreground">Tage Streak</div></div>
            <div><div className="text-3xl">🎯</div><div className="text-2xl font-bold">{p.total ? Math.round((p.correct / p.total) * 100) : 0}%</div><div className="text-xs font-bold text-muted-foreground">Trefferquote</div></div>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">Abzeichen</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {Object.entries(BADGES).map(([k, b]) => (
              <div key={k} title={b.name + ": " + b.desc} className={cn("grid aspect-square place-items-center rounded-xl text-2xl", p.badges.includes(k) ? "bg-gold/30" : "bg-muted opacity-40 grayscale")}>{b.emoji}</div>
            ))}
          </div>
        </Card>
        <Card>
          <label className="text-sm font-extrabold text-muted-foreground" htmlFor="name">Dein Name (für Rangliste)</label>
          <NameInput />
        </Card>
      </div>
    </div>
  );
}

function NameInput() {
  const { p, update } = useProgress();
  return <input id="name" value={p.name} maxLength={20} onChange={(e) => update((q) => ({ ...q, name: e.target.value }))}
    className="mt-2 w-full rounded-xl border-2 border-input bg-background px-3 py-2 font-bold" />;
}
