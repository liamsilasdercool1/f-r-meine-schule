import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SAETZE, shuffle, NIVEAUS, type Niveau } from "@/lib/komma";
import { Trainer, useSetNiveau } from "@/components/Trainer";
import { Btn } from "@/components/ui3d";

export const Route = createFileRoute("/einstufung")({
  head: () => ({ meta: [{ title: "Einstufungstest – Kommaheld" }, { name: "description", content: "Finde in 9 Sätzen heraus, welches Niveau zu dir passt." }, { property: "og:title", content: "Einstufungstest – Kommaheld" }, { property: "og:description", content: "Finde in 9 Sätzen heraus, welches Niveau zu dir passt." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Test,
});

function Test() {
  const saetze = useMemo(() => ([1, 2, 3] as Niveau[]).flatMap((n) => shuffle(SAETZE.filter((s) => s.niveau === n)).slice(0, 3)), []);
  const [res, setRes] = useState<Niveau | null>(null);
  const setNiveau = useSetNiveau();
  const nav = useNavigate();
  if (res) {
    const n = NIVEAUS.find((x) => x.id === res)!;
    return (
      <div className="mx-auto max-w-md animate-rise text-center">
        <div className="animate-pop text-7xl">{"⭐".repeat(res)}</div>
        <h1 className="mt-4 text-3xl font-bold">Empfohlen: {n.name}</h1>
        <p className="mt-2 text-muted-foreground">{n.desc}</p>
        <Btn className="mt-6" onClick={() => { setNiveau(res); nav({ to: "/" }); }}>Los geht's</Btn>
      </div>
    );
  }
  return <Trainer saetze={saetze} niveau={2} titel="Einstufungstest" record={false}
    onDone={({ byNiveau }) => setRes((byNiveau[3] ?? 0) >= 2 && (byNiveau[2] ?? 0) >= 2 ? 3 : (byNiveau[2] ?? 0) + (byNiveau[1] ?? 0) >= 4 ? 2 : 1)} />;
}
