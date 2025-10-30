export const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

//  לוודא שהסימון מועבר לקוד בצורה נקייה - c קטנה הופכת ל C וb הופך לסימון במול
export function normalizeNoteName(input: string): string {
  const s = input.trim()
  if (!s || s.length === 0) return input
  const up = s[0]!.toUpperCase() + s.slice(1) // "c#" -> "C#"
  // החלפות נפוצות: allow "♯" / "♭" אם רוצים
  return up.replace('♯', '#').replace('♭', 'b')
}
