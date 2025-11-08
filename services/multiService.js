// services/multiService.js
import { handleOpenAIChat } from "./openaiService.js";

export async function compareResponses(req, res) {
  const { prompt } = req.body;

  try {
    const start = Date.now();

    // ---- 今はOpenAIのみ ----
    const openaiResult = await handleOpenAIChat(prompt, true);

    const end = Date.now();
    const latency = `${end - start}ms`;

    res.json({
      prompt,
      results: [openaiResult],
      latency,
    });

  } catch (err) {
    console.error("❌ multiService Error:", err);
    res.status(500).json({ error: err.message });
  }
}
