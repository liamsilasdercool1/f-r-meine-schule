// Clientseitige Bot-Gegner: deterministisch pro Woche, wachsen im Laufe der Woche.
// Später ersetzbar durch eine Abfrage an eine echte Datenbank (gleiches Format: {name, xp, weeklyXp}).
import { weekId } from "./store";

const NAMEN = ["Lena", "Jonas", "Mia", "Elias", "Emma", "Noah", "Sophia", "Ben", "Hannah", "Paul", "Lea", "Finn", "Marie", "Luis", "Clara", "Felix", "Anna", "Leon", "Ida", "Moritz", "Ella", "Jakob", "Frieda", "Tim", "Greta", "Maxi", "Nele", "Oskar", "Lotta", "Henri"];
export type Spieler = { name: string; xp: number; weeklyXp: number; bot: boolean; avatar: string };
const AVATARE = ["🦊", "🐼", "🐸", "🦉", "🐯", "🐨", "🐙", "🦄", "🐧", "🐢"];

function rng(seed: number) { return () => ((seed = (seed * 16807) % 2147483647) / 2147483647); }
function hash(s: string) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 2147483647; return h || 1; }

export const LIGEN = [
  { name: "Bronze-Liga", min: 0, emoji: "🥉" },
  { name: "Silber-Liga", min: 400, emoji: "🥈" },
  { name: "Gold-Liga", min: 1200, emoji: "🥇" },
  { name: "Diamant-Liga", min: 3000, emoji: "💎" },
];
export const ligaFuer = (xp: number) => [...LIGEN].reverse().find((l) => xp >= l.min)!;

export function bots(ligaIdx: number): Spieler[] {
  const w = weekId();
  const r = rng(hash(w + ligaIdx));
  const now = new Date();
  const progress = ((now.getDay() + 6) % 7) / 7 + now.getHours() / 168; // 0..1 in der Woche
  const base = [60, 140, 260, 450][ligaIdx] ?? 60;
  return Array.from({ length: 14 }, (_, i) => {
    const pace = base * (0.3 + r() * 1.7);
    return {
      name: NAMEN[Math.floor(r() * NAMEN.length)] + " " + String.fromCharCode(65 + ((i * 7) % 26)) + ".",
      avatar: AVATARE[Math.floor(r() * AVATARE.length)]!,
      weeklyXp: Math.round(pace * Math.max(0.05, progress) + r() * 20),
      xp: Math.round(LIGEN[ligaIdx]!.min + r() * 800),
      bot: true,
    };
  });
}
