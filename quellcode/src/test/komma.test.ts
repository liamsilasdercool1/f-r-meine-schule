import { describe, expect, it } from "vitest";
import { decodeQuiz, encodeQuiz, REGELN, SAETZE, tokenize } from "@/lib/komma";

describe("Kommaregeln", () => {
  it("erkennt Kommapositionen", () => {
    const t = tokenize("Ich weiß, dass du kommst.");
    expect(t.words).toEqual(["Ich", "weiß", "dass", "du", "kommst."]);
    expect([...t.commas]).toEqual([1]);
  });
  it("hat 7 Regeln und alle drei Niveaus je Regel", () => {
    expect(REGELN).toHaveLength(7);
    for (const r of REGELN) for (const n of [1, 2, 3]) expect(SAETZE.some((s) => s.regel === r.nr && s.niveau === n)).toBe(true);
  });
  it("Quiz-Link überträgt Umlaute verlustfrei", () => {
    const q = { t: "Übung", s: [{ x: "Äpfel, Öl und Süßes." }] };
    expect(decodeQuiz(encodeQuiz(q))).toEqual(q);
  });
});
