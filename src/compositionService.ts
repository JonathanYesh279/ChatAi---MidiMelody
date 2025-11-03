import { generateMelodyWithAI } from './openaiService.js';
import { createMidiFile, generateFilename } from './music/midiWriter.js';

export interface CompositionResult {
  success: boolean;
  filepath?: string;
  filename?: string;
  message: string;
  details?: {
    root: string;
    scale: string;
    bars: number;
    tempo: number;
    noteCount: number;
  };
}

function parseComposeCommand(
  command: string
): { root: string; scale: string; bars: number } | null {
  const lowerCommand = command.toLowerCase().trim();

  const match = lowerCommand.match(
    /compose\s+([a-g][#b]?)\s+(major|minor|harmonic-minor|melodic-minor|pentatonic|blues)/i
  );

  if (!match) return null;

  const [, root, scale] = match;

  return {
    root: root!,
    scale: scale!,
    bars: 8,
  };
}

function validateAndFixNotes(notes: any[]): any[] {
  return notes.map((note) => ({
    pitch: Math.max(21, Math.min(108, note.pitch || 60)),
    duration: Math.max(0.25, Math.min(4, note.duration || 1)),
    velocity: Math.max(40, Math.min(127, note.velocity || 80)),
  }));
}

export async function composeFromCommand(
  command: string
): Promise<CompositionResult> {
  try {
    const parsed = parseComposeCommand(command);

    if (!parsed) {
      return {
        success: false,
        message:
          'Invalid command. Use format: "compose [note] [major/minor]"\nExample: "compose C minor" or "compose D major"\n\nAvailable scales: major, minor, harmonic-minor, melodic-minor, pentatonic, blues',
      };
    }

    const { root, scale, bars } = parsed;

    console.log(
      `🎵 Asking AI to compose ${bars}-bar melody in ${root} ${scale}...`
    );

    const aiNotes = await generateMelodyWithAI(root, scale, bars);

    if (!aiNotes || aiNotes.length === 0) {
      return {
        success: false,
        message: 'AI failed to generate a melody',
      };
    }

    const validatedNotes = validateAndFixNotes(aiNotes);

    console.log(`✅ AI generated ${validatedNotes.length} notes`);

    const filename = generateFilename(root, scale);
    const filepath = createMidiFile(validatedNotes, {
      filename,
      tempo: 120,
      timeSignature: [4, 4],
    });

    return {
      success: true,
      filepath,
      filename,
      message: `Successfully composed a ${bars}-bar AI-generated melody in ${root} ${scale}!`,
      details: {
        root,
        scale,
        bars,
        tempo: 120,
        noteCount: validatedNotes.length,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Composition error:', errorMessage);
    return {
      success: false,
      message: `Error composing melody: ${errorMessage}`,
    };
  }
}
