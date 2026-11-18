import raw from "@/data/kommaregeln_beispiele.json";

export type Niveau = 1 | 2 | 3;
export const NIVEAUS: { id: Niveau; name: string; kurz: string; desc: string }[] = [
  { id: 1, name: "Einsteiger", kurz: "Level 1", desc: "Einfache Sätze, klare Signalwörter, kurze Aufzählungen." },
  { id: 2, name: "Fortgeschritten", kurz: "Level 2", desc: "Satzgefüge, Infinitivgruppen und Einschübe." },
  { id: 3, name: "Profi", kurz: "Level 3", desc: "Verschachtelte Sätze, Ausnahmen und mehrteilige Konjunktionen." },
];

export type Satz = { id: string; text: string; regel: number; niveau: Niveau };

export type Regel = {
  nr: number;
  titel: string;
  emoji: string;
  original: string;
  signal: string[];
  erklaerung: Record<Niveau, string>;
  beispiele: Record<Niveau, string[]>;
  ausnahmen?: string[];
};

const TEXTE: Omit<Regel, "original" | "beispiele">[] = [
  {
    nr: 1, titel: "Aufzählungen", emoji: "📝",
    signal: ["und", "oder", "sowie"],
    erklaerung: {
      1: "Zählst du Dinge auf, kommt zwischen die Wörter ein Komma. Vor „und“ und „oder“ steht kein Komma.",
      2: "Gleichrangige Wörter, Wortgruppen oder kurze Hauptsätze werden durch Kommas getrennt – auch gleichrangige Adjektive („ein rotes, langes Kleid“). Sind sie mit „und“, „oder“ oder „sowie“ verbunden, entfällt das Komma.",
      3: "Reihungen gleichrangiger Satzglieder, Attribute und Hauptsätze trennt man durch Kommas, sofern keine nebenordnende Konjunktion (und, oder, sowie, bzw.) steht. Probe bei Adjektiven: Lässt sich „und“ einsetzen, sind sie gleichrangig → Komma. Bildet das letzte Adjektiv mit dem Nomen eine Einheit („ein schöner alter Schrank“, „dunkles bayerisches Bier“), steht kein Komma.",
    },
    ausnahmen: ["Kein Komma bei nicht gleichrangigen Adjektiven: „die neuen französischen Filme“.", "Kein Komma vor „und“, „oder“, „sowie“ in der Aufzählung."],
  },
  {
    nr: 2, titel: "Einschübe & Zusätze", emoji: "💬",
    signal: ["und zwar", "insbesondere", "zum Beispiel", "nämlich", "vor allem", "das heißt"],
    erklaerung: {
      1: "Anreden („Hugo, kommst du?“) und Ausrufe („Oh, wie schön!“) trennst du mit einem Komma vom Rest des Satzes ab.",
      2: "Anreden, Ausrufe, Einschübe, Appositionen und nachgestellte Erläuterungen werden mit Kommas abgetrennt. Zusätze beginnen oft mit Signalwörtern wie „und zwar“, „vor allem“, „zum Beispiel“ oder „nämlich“.",
      3: "Satzunterbrechungen (Anrede, Interjektion, Apposition, Einschub, nachgestellte Erläuterung) werden paarig abgetrennt: Steht der Einschub mitten im Satz, braucht er ein Komma davor UND danach („Ich, der gerade lernt, lerne gründlich.“). Die Apposition ist eine nachgetragene Erläuterung zum Nomen, kein eigener Satz. Ausnahme: Feste Beinamen und Namenszusätze („Karl der Große“) werden nicht abgetrennt.",
    },
    ausnahmen: ["Das schließende Komma nicht vergessen, wenn der Satz weitergeht.", "Kein Komma bei festen Namensbestandteilen: „Friedrich der Zweite“."],
  },
  {
    nr: 3, titel: "Entgegensetzende Konjunktionen", emoji: "↔️",
    signal: ["aber", "jedoch", "sondern", "doch", "einerseits – andererseits", "teils – teils"],
    erklaerung: {
      1: "Vor „aber“, „jedoch“ und „sondern“ steht ein Komma.",
      2: "Vor entgegensetzenden und einschränkenden Konjunktionen (aber, jedoch, sondern, doch) steht ein Komma – auch zwischen den Teilen mehrteiliger Bindewörter wie „einerseits …, andererseits …“.",
      3: "Entgegensetzende Konjunktionen (aber, doch, jedoch, sondern, vielmehr) verlangen ein Komma vor sich. Bei mehrteiligen Konjunktionen (einerseits – andererseits, teils – teils, je – desto) steht das Komma vor dem zweiten Teil. Achtung: Steht „aber“ am Satzanfang, gibt es davor natürlich kein Komma („Aber sich zu entspannen, bringt Vorteile.“) – ein Komma kann dann aus einem anderen Grund folgen.",
    },
    ausnahmen: ["„Aber“ am Satzanfang: kein Komma davor."],
  },
  {
    nr: 4, titel: "Nebenordnende Konjunktionen (kein Komma)", emoji: "🚫",
    signal: ["und", "oder", "sowie", "entweder – oder", "sowohl – als auch", "weder – noch"],
    erklaerung: {
      1: "Vor „und“ und „oder“ steht meistens KEIN Komma. Manchmal ist die richtige Antwort: gar kein Komma!",
      2: "Nebenordnende Konjunktionen wie und, oder, sowie, entweder – oder, sowohl – als auch, weder – noch verbinden Wörter, Wortgruppen oder Sätze ohne Komma.",
      3: "Bei nebenordnenden (auch mehrteiligen) Konjunktionen steht kein Komma: „Ich mache sowohl Sport als auch Hausaufgaben.“ Ausnahmen: Ein vorher eingeschobener Nebensatz oder Einschub wird trotzdem mit Komma geschlossen; zwischen zwei vollständigen Hauptsätzen mit „und/oder“ darf ein Komma zur Gliederung gesetzt werden (fakultativ).",
    },
    ausnahmen: ["Ein Einschub vor „und“ wird trotzdem geschlossen: „Er, mein Freund, und ich …“", "Zwischen Hauptsätzen mit „und“ ist ein Komma erlaubt, aber nicht nötig."],
  },
  {
    nr: 5, titel: "Infinitivgruppen", emoji: "🎯",
    signal: ["um zu", "ohne zu", "anstatt zu", "statt zu", "als zu", "außer zu"],
    erklaerung: {
      1: "Beginnt eine Wortgruppe mit „um … zu“, „ohne … zu“ oder „anstatt … zu“, trennst du sie mit einem Komma ab.",
      2: "Eine Infinitivgruppe besteht aus „zu“ + Verb im Infinitiv. Sie wird abgetrennt, wenn sie mit um, ohne, (an)statt, als oder außer eingeleitet wird – oder wenn ein Wort wie „es“, „daran“ oder ein Nomen auf sie hinweist („Es ist wichtig, rechtzeitig zu üben.“).",
      3: "Die Infinitivgruppe muss in drei Fällen abgetrennt werden: 1) Sie wird durch um, ohne, statt, anstatt, außer oder als eingeleitet. 2) Ein Nomen oder Verweiswort (es, das, daran, darauf, dann) im übergeordneten Satz weist auf sie hin. 3) Sie hängt von einem Nomen ab („Die Idee, ein neues Gerät zu benutzen, ist schlau.“). Außerdem darf/sollte man ein Komma setzen, um Missverständnisse zu vermeiden. Eingeschobene Infinitivgruppen werden paarig abgetrennt.",
    },
    ausnahmen: ["Bloßer Infinitiv ohne Einleitung und Hinweiswort: Komma freiwillig („Er versprach(,) zu kommen.“)."],
  },
  {
    nr: 6, titel: "Hauptsätze verbinden", emoji: "🔗",
    signal: ["sonst", "deshalb", "denn", "dann"],
    erklaerung: {
      1: "Stehen zwei ganze Sätze nebeneinander ohne „und“ oder „oder“, kommt dazwischen ein Komma: „Die Sonne scheint, die Vögel singen.“",
      2: "In Satzreihen trennt das Komma gleichrangige Hauptsätze, wenn sie nicht durch „und“ oder „oder“ verbunden sind. Das gilt auch, wenn der zweite Satz mit einem Adverb wie „sonst“, „deshalb“ oder „dann“ beginnt.",
      3: "Selbstständige Hauptsätze in einer Satzverbindung werden durch Komma getrennt. Bei „und“, „oder“, „beziehungsweise“, „entweder – oder“, „weder – noch“ entfällt das Pflichtkomma; ein Komma ist dort fakultativ, um die Gliederung zu verdeutlichen. Vor der Konjunktion „denn“ und vor Adverbien wie „sonst“ steht immer ein Komma.",
    },
    ausnahmen: ["Bei „und/oder“ zwischen Hauptsätzen ist das Komma freiwillig."],
  },
  {
    nr: 7, titel: "Haupt- und Nebensatz", emoji: "🧩",
    signal: ["weil", "dass", "wenn", "obwohl", "als", "der/die/das", "indem", "damit", "ob"],
    erklaerung: {
      1: "Wörter wie „weil“, „dass“, „wenn“ oder „obwohl“ starten einen Nebensatz. Davor (oder danach) steht ein Komma.",
      2: "Das Komma trennt immer Hauptsatz und Nebensatz – egal ob der Nebensatz vorne, hinten oder in der Mitte steht. Nebensätze beginnen mit Konjunktionen (weil, dass, wenn, obwohl, indem) oder Relativpronomen (der, die, das, welcher). Das Verb steht im Nebensatz am Ende.",
      3: "In Satzgefügen werden Haupt- und Nebensätze sowie voneinander abhängige Nebensätze verschiedenen Grades durch Kommas getrennt; eingeschobene Nebensätze paarig. AUSNAHME: Gleichrangige Nebensätze, die mit „und“ oder „oder“ verbunden sind, werden nicht durch Komma getrennt („Ich weiß, dass du kommst und dass du pünktlich bist.“). Mehrteilige Einleitungen wie „ohne dass“, „als ob“, „so dass“ trennt man nicht in sich.",
    },
    ausnahmen: ["Kein Komma zwischen gleichrangigen Nebensätzen mit „und/oder“.", "Kein Komma innerhalb von „als ob“, „ohne dass“, „sodass“."],
  },
];

// Zusätzliche Profi-Sätze für Ausnahmen
const EXTRA: { regel: number; text: string }[] = [
  { regel: 7, text: "Ich weiß, dass du müde bist und dass du morgen früh aufstehen musst." },
  { regel: 7, text: "Sie fragte, ob wir mitkommen oder ob wir lieber zu Hause bleiben." },
  { regel: 7, text: "Der Lehrer, der uns gestern erklärte, wie man Kommas setzt, war sehr geduldig." },
  { regel: 7, text: "Wenn es morgen regnet und wenn der Wind stark weht, bleiben wir drinnen." },
  { regel: 7, text: "Er tat so, als ob er nichts gehört hätte." },
  { regel: 3, text: "Einerseits wollte sie reisen, andererseits fehlte ihr das Geld, das sie dafür brauchte." },
  { regel: 4, text: "Weder der Bus noch die Bahn fuhr an diesem Morgen pünktlich." },
  { regel: 4, text: "Wir haben sowohl die Hausaufgaben erledigt als auch für die Klassenarbeit gelernt." },
  { regel: 5, text: "Sie dachte nicht daran, aufzugeben, obwohl es schwer war." },
  { regel: 2, text: "Herr Meier, unser Hausmeister, hat das Fenster, das seit Wochen klemmte, repariert." },
];

function score(s: string) {
  const words = s.split(/\s+/).length;
  const commas = (s.match(/,/g) || []).length;
  return words + commas * 4;
}

function build(): { regeln: Regel[]; saetze: Satz[] } {
  const saetze: Satz[] = [];
  const regeln: Regel[] = [];
  for (const r of (raw as { regeln: { regel_nummer: number; beschreibung: string; beispiele: string[] }[] }).regeln) {
    const t = TEXTE.find((x) => x.nr === r.regel_nummer)!;
    const sorted = [...r.beispiele].sort((a, b) => score(a) - score(b));
    const n = sorted.length;
    const bsp: Record<Niveau, string[]> = { 1: [], 2: [], 3: [] };
    sorted.forEach((text, i) => {
      const niveau = (i < n / 3 ? 1 : i < (2 * n) / 3 ? 2 : 3) as Niveau;
      saetze.push({ id: `${r.regel_nummer}-${i}`, text, regel: r.regel_nummer, niveau });
      if (bsp[niveau].length < 3) bsp[niveau].push(text);
    });
    EXTRA.filter((e) => e.regel === r.regel_nummer).forEach((e, i) => {
      saetze.push({ id: `${r.regel_nummer}-x${i}`, text: e.text, regel: r.regel_nummer, niveau: 3 });
      if (i === 0) bsp[3].unshift(e.text);
    });
    regeln.push({ ...t, original: r.beschreibung, beispiele: bsp });
  }
  return { regeln, saetze };
}

export const { regeln: REGELN, saetze: SAETZE } = build();
export const regelByNr = (nr: number) => REGELN.find((r) => r.nr === nr)!;

/** Wörter ohne Kommas + Indizes der Lücken (nach Wort i), an denen ein Komma steht. */
export function tokenize(text: string) {
  const parts = text.trim().split(/\s+/);
  const words: string[] = [];
  const commas = new Set<number>();
  parts.forEach((p, i) => {
    if (p === "," ) { commas.add(words.length - 1); return; }
    if (p.endsWith(",")) { commas.add(words.length); words.push(p.slice(0, -1)); }
    else words.push(p);
    void i;
  });
  return { words, commas };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function pickSaetze(opts: { niveau?: Niveau; regeln?: number[] | undefined; n: number }): Satz[] {
  let pool = SAETZE.filter(
    (s) => (!opts.niveau || s.niveau <= opts.niveau) && (!opts.regeln?.length || opts.regeln.includes(s.regel)),
  );
  if (opts.niveau) {
    const exact = pool.filter((s) => s.niveau === opts.niveau);
    pool = shuffle(exact).concat(shuffle(pool.filter((s) => s.niveau !== opts.niveau)));
    return pool.slice(0, opts.n).sort(() => Math.random() - 0.5);
  }
  return shuffle(pool).slice(0, opts.n);
}

/* ---------- Quiz-Links (base64, ohne Datenbank) ---------- */
export type QuizPayload =
  | { t: string; s: { x: string; r?: number }[] }
  | { t: string; r: number[]; l: Niveau; n: number };

export function encodeQuiz(q: QuizPayload): string {
  const bytes = new TextEncoder().encode(JSON.stringify(q));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeQuiz(s: string): QuizPayload | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64 + "===".slice((b64.length + 3) % 4));
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}
export function quizToSaetze(q: QuizPayload): Satz[] {
  if ("s" in q) return q.s.map((e, i) => ({ id: `q-${i}`, text: e.x, regel: e.r ?? 0, niveau: 2 }));
  return pickSaetze({ niveau: q.l, regeln: q.r, n: q.n });
}

/* ---------- Ränge ---------- */
export const RAENGE = [
  { min: 0, titel: "Komma-Neuling", emoji: "🐣" },
  { min: 100, titel: "Satzzeichen-Lehrling", emoji: "✏️" },
  { min: 300, titel: "Satzzeichen-Jäger", emoji: "🏹" },
  { min: 700, titel: "Komma-Kenner", emoji: "🎓" },
  { min: 1500, titel: "Komma-Meister", emoji: "🥇" },
  { min: 3000, titel: "Komma-Großmeister", emoji: "👑" },
];
export const rangFuer = (xp: number) => [...RAENGE].reverse().find((r) => xp >= r.min)!;
export const spielerLevel = (xp: number) => Math.floor(Math.sqrt(xp / 40)) + 1;
export const xpFuerLevel = (lvl: number) => (lvl - 1) ** 2 * 40;
