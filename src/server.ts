import "dotenv/config"
import express from "express"
import type { Request, Response } from "express"
import { chatWithAI } from "./openaiService.js"

const app = express()
app.use(express.json())

app.post("/chat", async (req: Request, res: Response) => {
  const { message } = req.body || {}

  if (!message) return res.status(400).json({ error: "Message is required - please provide a message to chat with the AI" })
  
  const aiResponse = await chatWithAI(message)
  res.send({ reply: aiResponse })
})

app.listen(4000, () => console.log("Server is running on port 4000"))