// services/openaiService.js
import OpenAI from "openai";
import { formatResponse, handleError } from "../utils/formatter.js";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleOpenAIChat(req, res) {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json(formatResponse("OpenAI", completion.choices[0].message.content));
  } catch (err) {
    handleError(res, err, "OpenAI");
  }
}
