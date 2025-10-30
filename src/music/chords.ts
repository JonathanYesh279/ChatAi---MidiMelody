import { NOTE_TO_SEMITONE, normalizeNoteName } from './notes.js';

const CHORD_INTERVALS: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
};

const SEMITONES_TO_NOTE = Object.entries(NOTE_TO_SEMITONE).reduce(
  (acc, [note, semitone]) => {
    const semitoneNum = semitone as number
    if (!acc[semitoneNum]) acc[semitoneNum] = note // נשמור רק אחת מכל קבוצה
    return acc
  },
  {} as Record<number, string>
)

export function getChordNotes(root: string, type: string): string[] {
  const base = normalizeNoteName(root);
  const baseSemitone = NOTE_TO_SEMITONE[base];

  if (baseSemitone === undefined) throw new Error(`Unknown note: ${root}`);

  const intervals = CHORD_INTERVALS[type];
  if (!intervals) throw new Error(`Unknown chord type: ${type}`);

  return intervals.map((i) => {
    const semitone = (baseSemitone + i) % 12;
    const note = SEMITONES_TO_NOTE[semitone]
    if (!note) throw new Error(`No note found for semitone: ${semitone}`)
    return note
  });
}
