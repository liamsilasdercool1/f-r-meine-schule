import { Link } from "@tanstack/react-router";
import { BookOpen, GraduationCap, Home, PenLine, Trophy, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useProgress } from "@/lib/store";
import { NIVEAUS } from "@/lib/komma";

const NAV = [
  { to: "/", label: "Start", icon: Home },
  { to: "/ueben", label: "Üben", icon: PenLine },
  { to: "/lexikon", label: "Lexikon", icon: BookOpen },
  { to: "/rangliste", label: "Rangliste", icon: Trophy },
  { to: "/lehrer", label: "Lehrer", icon: GraduationCap },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const { p } = useProgress();
  const [mute, setMute] = useState(false);
  useEffect(() => setMute(localStorage.getItem("kommaheld-mute") === "1"), []);
  const niv = NIVEAUS.find((n) => n.id === p.niveau);
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl font-bold text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">,</span>
            <span className="hidden sm:inline">Kommaheld</span>
          </Link>
          <nav className="ml-4 hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="rounded-xl px-3 py-2 text-sm font-bold text-muted-foreground hover:bg-muted"
                activeProps={{ className: "bg-accent !text-accent-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm font-extrabold">
            {niv && <span className="hidden rounded-lg bg-secondary/15 px-2 py-1 text-secondary-deep sm:inline">{niv.name}</span>}
            <span className="text-streak" title="Tages-Streak">🔥 {p.streak}</span>
            <span className="text-gold-deep" title="XP">⭐ {p.xp}</span>
            <button aria-label={mute ? "Ton an" : "Ton aus"} className="text-muted-foreground"
              onClick={() => { const m = !mute; setMute(m); localStorage.setItem("kommaheld-mute", m ? "1" : "0"); }}>
              {mute ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t-2 border-border bg-card md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-muted-foreground"
            activeProps={{ className: "!text-primary" }}>
            <n.icon size={22} />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
