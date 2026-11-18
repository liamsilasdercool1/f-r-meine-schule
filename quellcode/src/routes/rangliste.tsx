import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/lib/store";
import { bots, ligaFuer, LIGEN } from "@/lib/bots";
import { RAENGE, rangFuer } from "@/lib/komma";
import { Card } from "@/components/ui3d";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/rangliste")({
  head: () => ({ meta: [{ title: "Rangliste – Kommaheld" }, { name: "description", content: "Miss dich in Wochenligen mit anderen Kommahelden und steige auf." }, { property: "og:title", content: "Rangliste – Kommaheld" }, { property: "og:description", content: "Miss dich in Wochenligen mit anderen Kommahelden und steige auf." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Rangliste,
});

function Rangliste() {
  const { p, ready } = useProgress();
  if (!ready) return null;
  const liga = ligaFuer(p.xp);
  const li = LIGEN.indexOf(liga);
  const liste = [...bots(li), { name: p.name || "Du", xp: p.xp, weeklyXp: p.weeklyXp, bot: false, avatar: "⭐" }].sort((a, b) => b.weeklyXp - a.weeklyXp);
  return (
    <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
      <div className="md:col-span-2">
        <div className="text-center"><div className="text-6xl">{liga.emoji}</div><h1 className="text-3xl font-bold">{liga.name}</h1>
          <p className="text-sm text-muted-foreground">Wochenwertung · Top 3 steigen auf · Neustart jeden Montag</p></div>
        <Card className="mt-5 p-2">
          {liste.map((s, i) => (
            <div key={i} className={cn("flex items-center gap-3 rounded-xl px-3 py-2", !s.bot && "bg-accent", i === 3 && "mt-2 border-t-2 border-dashed border-border pt-3")}>
              <span className={cn("w-7 text-center font-display text-lg font-bold", i < 3 ? "text-gold-deep" : "text-muted-foreground")}>{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-muted text-xl">{s.avatar}</span>
              <span className="flex-1"><span className="font-bold">{s.name}{!s.bot && " (Du)"}</span><span className="block text-xs text-muted-foreground">{rangFuer(s.xp).emoji} {rangFuer(s.xp).titel}</span></span>
              <span className="font-extrabold">{s.weeklyXp} XP</span>
            </div>
          ))}
        </Card>
      </div>
      <Card className="h-fit">
        <h2 className="text-lg font-bold">Ränge & Titel</h2>
        <ul className="mt-3 space-y-2">
          {RAENGE.map((r) => (
            <li key={r.titel} className={cn("flex items-center gap-2 rounded-lg p-2 text-sm", rangFuer(p.xp).titel === r.titel && "bg-gold/30 font-extrabold")}>
              <span className="text-xl">{r.emoji}</span><span className="flex-1">{r.titel}</span><span className="text-muted-foreground">{r.min}+</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
