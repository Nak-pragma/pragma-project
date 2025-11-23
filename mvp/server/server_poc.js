// server_poc.js MVP version (Render-ready)

import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultModel = "gpt-4o-mini";

app.post("/mvp/thread-chat", async (req, res) => {
  try {
    const model = req.body.model || defaultModel;
    const messages = req.body.messages || [];

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 2000
    });

    res.json({ result: completion.choices[0].message });
  } catch (e) {
    console.error("[Error] /mvp/thread-chat:", e);
    res.status(500).json({ error: e.message });
  }
});

// ------------- IMPORTANT: Required for Render -------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MVP server running on port ${PORT}`);
});
// -----------------------------------------------------------

export default app;
