import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import { chatWithAI } from './openaiService.js';
import { composeFromCommand } from './compositionService.js';
import path from 'path';

const app = express();
app.use(express.json());

app.use('/output', express.static(path.join(process.cwd(), 'output')));

app.post('/chat', async (req: Request, res: Response) => {
  const { message } = req.body || {};

  if (!message) {
    return res.status(400).json({
      error: 'Message is required',
    });
  }

  const aiResponse = await chatWithAI(message);
  res.json({ reply: aiResponse });
});

app.post('/compose', async (req: Request, res: Response) => {
  const { command } = req.body || {};

  if (!command) {
    return res.status(400).json({
      error: 'Command is required',
      example: 'compose C minor',
      format: 'compose [note] [scale]',
      availableScales: [
        'major',
        'minor',
        'harmonic-minor',
        'melodic-minor',
        'pentatonic',
        'blues',
      ],
    });
  }

  console.log(`📥 Received command: ${command}`);

  const result = await composeFromCommand(command);

  if (result.success) {
    return res.json({
      success: true,
      message: result.message,
      details: result.details,
      downloadUrl: `/output/${result.filename}`,
      filepath: result.filepath,
    });
  } else {
    return res.status(400).json({
      success: false,
      error: result.message,
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'running',
    message: 'AI MIDI Melody Composer',
    endpoints: {
      chat: 'POST /chat - Chat with AI',
      compose: 'POST /compose - AI-generated melodies',
    },
    example: {
      endpoint: '/compose',
      body: { command: 'compose C minor' },
    },
  });
});

app.listen(4000, () => console.log('AI MIDI Composer running on port 4000'));
