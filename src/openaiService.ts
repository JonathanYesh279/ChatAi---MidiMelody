import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateMelodyWithAI(
  root: string,
  scale: string,
  bars: number = 8
): Promise<any> {
  const scaleNotes = getScaleNotes(root, scale);
  const rootMidiNote = scaleNotes[0];

  const prompt = `You are a professional music composer. Create a beautiful ${bars}-bar melody in ${root} ${scale}.

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. Use ONLY these MIDI note numbers (these are the ${root} ${scale} scale notes):
   ${scaleNotes.join(', ')}
   
2. Start on the root note: ${rootMidiNote}
3. End on the root note: ${rootMidiNote}
4. Create ${bars * 3} to ${bars * 4} notes total
5. Make it MUSICAL:
   - Use mostly stepwise motion (move to adjacent notes in the list above)
   - Add occasional leaps for interest (jump by 3-4 notes in the scale)
   - Create a clear phrase structure with a climax in the middle
   - Use longer notes (duration 2-4) for phrase endings
   - Use shorter notes (duration 0.5-1) for movement
   
6. Duration in beats: 0.25 = sixteenth, 0.5 = eighth, 1 = quarter, 2 = half, 4 = whole
7. Velocity: 60-70 = soft, 75-85 = medium, 90-100 = loud
8. Make sure the character matches the scale:
   ${getScaleCharacter(scale)}

EXAMPLE OF GOOD MELODY STRUCTURE:
- Bars 1-2: Introduce theme, mostly stepwise, medium velocity
- Bars 3-4: Development, add some leaps, build intensity
- Bars 5-6: Climax, highest notes, loudest velocity
- Bars 7-8: Resolution back to root, slower rhythm, softer

Return ONLY valid JSON array (no explanation):
[
  {"pitch": ${rootMidiNote}, "duration": 1, "velocity": 75},
  {"pitch": ${scaleNotes[1]}, "duration": 1, "velocity": 80},
  {"pitch": ${scaleNotes[2]}, "duration": 0.5, "velocity": 75}
]

Generate the melody now:`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a professional music composer who creates beautiful, scale-accurate melodies. Always return valid JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 1.0,
  });

  const response = completion.choices[0]?.message?.content || '[]';

  const jsonMatch = response.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('AI did not return valid JSON');
  }

  const notes = JSON.parse(jsonMatch[0]);

  const validatedNotes = validateScaleAccuracy(notes, scaleNotes, rootMidiNote);

  return validatedNotes;
}

function getScaleNotes(root: string, scale: string): number[] {
  const noteMap: Record<string, number> = {
    c: 60,
    'c#': 61,
    db: 61,
    d: 62,
    'd#': 63,
    eb: 63,
    e: 64,
    f: 65,
    'f#': 66,
    gb: 66,
    g: 67,
    'g#': 68,
    ab: 68,
    a: 69,
    'a#': 70,
    bb: 70,
    b: 71,
  };

  const intervals: Record<string, number[]> = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    'harmonic-minor': [0, 2, 3, 5, 7, 8, 11],
    'melodic-minor': [0, 2, 3, 5, 7, 9, 11],
    pentatonic: [0, 2, 4, 7, 9],
    blues: [0, 3, 5, 6, 7, 10],
  };

  const rootNote = noteMap[root.toLowerCase()] || 60;
  const scaleIntervals = intervals[scale] || intervals['major'];

  const notes: number[] = [];
  for (let octave = 0; octave < 2; octave++) {
    for (const interval of scaleIntervals) {
      notes.push(rootNote + interval + octave * 12);
    }
  }

  return notes;
}

function getScaleCharacter(scale: string): string {
  const characters: Record<string, string> = {
    major: 'Happy, bright, uplifting feeling. Use confident, forward motion.',
    minor:
      'Sad, melancholic, introspective feeling. Use descending phrases and softer dynamics.',
    'harmonic-minor':
      'Exotic, dramatic, Middle-Eastern feeling. Emphasize the raised 7th scale degree.',
    'melodic-minor':
      'Smooth, sophisticated, jazz-like feeling. Use flowing, stepwise motion.',
    pentatonic:
      'Simple, folk-like, universal feeling. Very singable and memorable.',
    blues:
      'Bluesy, soulful, emotional feeling. Use blue notes and expressive phrasing.',
  };

  return characters[scale] || 'Musical and expressive';
}

function validateScaleAccuracy(
  notes: any[],
  allowedNotes: number[],
  rootNote: number
): any[] {
  return notes.map((note, index) => {
    let pitch = note.pitch;

    if (!allowedNotes.includes(pitch)) {
      const closest = allowedNotes.reduce((prev, curr) =>
        Math.abs(curr - pitch) < Math.abs(prev - pitch) ? curr : prev
      );
      console.log(`⚠️  Fixed note ${pitch} → ${closest} (not in scale)`);
      pitch = closest;
    }

    if (index === 0 || index === notes.length - 1) {
      pitch = rootNote;
    }

    return {
      pitch,
      duration: Math.max(0.25, Math.min(4, note.duration || 1)),
      velocity: Math.max(50, Math.min(100, note.velocity || 75)),
    };
  });
}
