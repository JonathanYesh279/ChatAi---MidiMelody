import MidiWriterJS from 'midi-writer-js';
import fs from 'fs';
import path from 'path';

const MidiWriter = MidiWriterJS as any;

export interface MidiFileOptions {
  filename: string;
  tempo: number;
  timeSignature: [number, number];
}

export function createMidiFile(notes: any[], options: MidiFileOptions): string {
  const { filename, tempo, timeSignature } = options;

  const track = new MidiWriter.Track();

  track.setTempo(tempo);

  for (const note of notes) {
    const duration = convertDurationToMidiString(note.duration);

    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: note.pitch,
        duration: duration,
        velocity: note.velocity || 80,
      })
    );
  }

  const write = new MidiWriter.Writer(track);

  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  const buffer = Buffer.from(write.buildFile());
  fs.writeFileSync(filepath, buffer);

  return filepath;
}

function convertDurationToMidiString(duration: number): string {
  if (duration >= 4) return '1';
  if (duration >= 2) return '2';
  if (duration >= 1) return '4';
  if (duration >= 0.5) return '8';
  if (duration >= 0.25) return '16';
  return '8';
}

export function generateFilename(root: string, scale: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `melody_${root}_${scale}_AI_${timestamp}.mid`;
}
