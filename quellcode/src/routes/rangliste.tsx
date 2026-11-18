import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/lib/store";
import { useRealPlayers } from "@/lib/players";
import { ligaFuer, LIGEN } from "@/lib/bots";
import { RAENGE, rangFuer } from "@/lib/komma";
import { Card } from "@/components/ui3d";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rangliste")({
  head: () => ({ meta: [{ title: "Rangliste – Kommaheld" }, { name: "description", content: "Vergleiche dich mit echten Kommahelden." }] }),
  component: Rangliste,
});

function Rangliste() {
  const { p } = useProgress();
  const { players, loading, error } = useRealPlayers();
  const liga = ligaFuer(p.xp);
  const li = LIGEN.indexOf(liga);
  const liste = players.filter((x) => ligaFuer(x.xp) === liga);
  return <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
    <div className="md:col-span-2"><div className="text-center"><div className="text-6xl">{liga.emoji}</div><h1 className="text-3xl font-bold">{liga.name}</h1><p className="text-sm text-muted-foreground">Echte Spieler · Wochenwertung · Neustart jeden Montag</p></div>
      <Card className="mt-5 space-y-2 p-2">
        {loading && <p className="p-4 text-center">Rangliste wird geladen …</p>}
        {error && <p className="p-4 text-center text-destructive">Datenbank nicht erreichbar. Bitte Supabase-Schema einrichten.</p>}
        {!loading && !error && !liste.length && <p className="p-4 text-center text-muted-foreground">Noch keine Spieler in dieser Liga. Lade deine Freunde ein!</p>}
        {liste.map((s, i) => <div key={s.id} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", i < 3 && "bg-accent")}>
          <span className={cn("w-7 text-center text-lg font-bold", i < 3 ? "text-gold-deep" : "text-muted-foreground")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
          {s.avatar ? <img src={s.avatar} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-xl">⭐</span>}
          <span className="flex-1"><span className="font-bold">{s.name}{s.name === p.name && " (Du)"}</span><span className="block text-xs text-muted-foreground">{rangFuer(s.xp).emoji} {rangFuer(s.xp).titel}</span></span>
          <span className="font-extrabold">{s.weeklyXp} XP</span>
        </div>)}
      </Card>
    </div>
    <Card className="h-fit"><h2 className="text-lg font-bold">Ränge & Titel</h2><ul className="mt-3 space-y-2">{RAENGE.map((r) => <li key={r.titel} className={cn("flex items-center gap-2 rounded-lg p-2 text-sm", rangFuer(p.xp).titel === r.titel && "bg-gold/30 font-extrabold")}><span className="text-xl">{r.emoji}</span><span className="flex-1">{r.titel}</span><span className="text-muted-foreground">{r.min}+</span></li>)}</ul></Card>
    <span className="hidden">{li}</span>
  </div>;
}
