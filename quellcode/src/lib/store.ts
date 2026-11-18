import { useEffect, useState, useCallback } from "react";
import type { Niveau } from "./komma";

export type Progress = {
  name: string;
  niveau: Niveau | null;
  xp: number;
  weeklyXp: number;
  week: string;
  streak: number;
  lastDay: string | null;
  correctInRow: number;
  bestRow: number;
  total: number;
  correct: number;
  perRule: Record<number, { a: number; e: number }>;
  badges: string[];
  history: { d: string; xp: number }[];
};

const KEY = "kommaheld-progress-v1";
const today = () => new Date().toISOString().slice(0, 10);
export const weekId = (d = new Date()) => {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const y = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return `${t.getUTCFullYear()}-W${Math.ceil(((+t - +y) / 864e5 + 1) / 7)}`;
};

export const DEFAULT: Progress = {
  name: "Du", niveau: null, xp: 0, weeklyXp: 0, week: weekId(), streak: 0, lastDay: null,
  correctInRow: 0, bestRow: 0, total: 0, correct: 0, perRule: {}, badges: [], history: [],
};

export const BADGES: Record<string, { name: string; emoji: string; desc: string }> = {
  erster: { name: "Erster Schritt", emoji: "🌱", desc: "Ersten Satz richtig gelöst" },
  serie10: { name: "Unaufhaltsam", emoji: "🔥", desc: "10 Sätze in Folge richtig" },
  streak3: { name: "Dranbleiber", emoji: "📅", desc: "3 Tage Streak" },
  streak7: { name: "Wochenheld", emoji: "🗓️", desc: "7 Tage Streak" },
  alle7: { name: "Allrounder", emoji: "🌈", desc: "Alle 7 Regeln geübt" },
  xp500: { name: "500 XP", emoji: "⭐", desc: "500 XP gesammelt" },
  profi: { name: "Profi-Modus", emoji: "💎", desc: "50 Sätze auf Profi-Niveau geübt" },
  hundert: { name: "Hunderter", emoji: "💯", desc: "100 Sätze bearbeitet" },
};

function load(): Progress {
  try {
    const p = { ...DEFAULT, ...JSON.parse(localStorage.getItem(KEY) || "{}") } as Progress;
    if (p.week !== weekId()) { p.week = weekId(); p.weeklyXp = 0; }
    return p;
  } catch { return DEFAULT; }
}

const listeners = new Set<(p: Progress) => void>();
let current: Progress | null = null;

export function setProgress(fn: (p: Progress) => Progress) {
  const next = fn(current ?? load());
  current = next;
  localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l(next));
}

export function useProgress() {
  const [p, setP] = useState<Progress>(DEFAULT);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    current = current ?? load();
    setP(current);
    setReady(true);
    listeners.add(setP);
    return () => { listeners.delete(setP); };
  }, []);
  const update = useCallback((fn: (p: Progress) => Progress) => setProgress(fn), []);
  return { p, ready, update };
}

/** Ergebnis eines Satzes eintragen; gibt neu erhaltene Badges zurück. */
export function recordAnswer(regel: number, richtig: boolean, niveau: Niveau): { xp: number; neu: string[] } {
  let gained = 0; let neu: string[] = [];
  setProgress((p) => {
    const q: Progress = { ...p, perRule: { ...p.perRule }, history: [...p.history] };
    const d = today();
    if (q.lastDay !== d) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      q.streak = q.lastDay === y ? q.streak + 1 : 1;
      q.lastDay = d;
    }
    gained = richtig ? 10 * niveau + (q.correctInRow >= 4 ? 5 : 0) : 1;
    q.xp += gained; q.weeklyXp += gained; q.total += 1;
    if (richtig) { q.correct += 1; q.correctInRow += 1; q.bestRow = Math.max(q.bestRow, q.correctInRow); }
    else q.correctInRow = 0;
    if (regel) {
      const r = q.perRule[regel] ?? { a: 0, e: 0 };
      q.perRule[regel] = { a: r.a + 1, e: r.e + (richtig ? 0 : 1) };
    }
    const h = q.history.find((x) => x.d === d);
    if (h) h.xp += gained; else q.history.push({ d, xp: gained });
    q.history = q.history.slice(-30);
    const profiCount = (JSON.parse(localStorage.getItem(KEY + "-profi") || "0") as number) + (niveau === 3 ? 1 : 0);
    localStorage.setItem(KEY + "-profi", JSON.stringify(profiCount));
    const checks: [string, boolean][] = [
      ["erster", q.correct >= 1], ["serie10", q.bestRow >= 10], ["streak3", q.streak >= 3],
      ["streak7", q.streak >= 7], ["alle7", Object.keys(q.perRule).length >= 7], ["xp500", q.xp >= 500],
      ["profi", profiCount >= 50], ["hundert", q.total >= 100],
    ];
    neu = checks.filter(([k, ok]) => ok && !q.badges.includes(k)).map(([k]) => k);
    q.badges = [...q.badges, ...neu];
    return q;
  });
  return { xp: gained, neu };
}
