import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { decodeQuiz, pickSaetze, quizToSaetze, regelByNr, type Satz, type Niveau } from "@/lib/komma";
import { useProgress } from "@/lib/store";
import { Trainer } from "@/components/Trainer";

type Search = { quiz?: string | undefined; regel?: number | undefined };
export const Route = createFileRoute("/ueben")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    quiz: typeof s["quiz"] === "string" ? s["quiz"] : undefined,
    regel: s["regel"] ? Number(s["regel"]) : undefined,
  }),
  head: () => ({ meta: [{ title: "Komma-Trainer – Kommaheld" }, { name: "description", content: "Setze Kommas per Klick und erhalte sofort Feedback mit der passenden Regel." }, { property: "og:title", content: "Komma-Trainer – Kommaheld" }, { property: "og:description", content: "Setze Kommas per Klick und erhalte sofort Feedback mit der passenden Regel." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Ueben,
});

function Ueben() {
  const { quiz, regel } = Route.useSearch();
  const { p, ready } = useProgress();
  const [saetze, setSaetze] = useState<Satz[] | null>(null);
  const [titel, setTitel] = useState<string>();
  const [niveau, setNiveau] = useState<Niveau>(1);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const n = (p.niveau ?? 1) as Niveau;
    if (quiz) {
      const q = decodeQuiz(quiz);
      if (!q) { setErr(true); return; }
      setTitel("Aufgabe: " + (q.t || "Übung deiner Lehrkraft"));
      setNiveau("l" in q ? q.l : n);
      setSaetze(quizToSaetze(q));
    } else {
      setNiveau(n);
      setTitel(regel ? `Regel ${regel}: ${regelByNr(regel)?.titel}` : undefined);
      setSaetze(pickSaetze({ niveau: n, regeln: regel ? [regel] : undefined, n: 10 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, quiz, regel]);
  if (err) return <div className="text-center"><p className="text-xl font-bold">Dieser Aufgaben-Link ist ungültig.</p><Link to="/" className="font-bold text-secondary-deep">Zur Startseite</Link></div>;
  if (!saetze) return null;
  return <Trainer key={quiz ?? String(regel)} saetze={saetze} niveau={niveau} titel={titel} />;
}
