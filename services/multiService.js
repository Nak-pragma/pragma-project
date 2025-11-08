/**
 * ==========================================================
 *  multiService.js
 *  ✅ OpenAI専用 (req.body修正版)
 * ==========================================================
 */
import { handleOpenAIChat } from "./openaiService.js";

export async function compareResponses(req, res) {
  try {
    // --- 入力チェック ---
    const { prompt } = req.body || {};
    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Missing prompt text." });
    }

    console.log("🔹 [multiService] Prompt received:", prompt);
    const start = Date.now();

    // --- OpenAIチャット呼び出し ---
    const openaiResult = await handleOpenAIChat(prompt, true);

    const latency = `${Date.now() - start}ms`;
    console.log("✅ [multiService] OpenAI response OK:", latency);

    // --- 結果を返す ---
    return res.json({
      prompt,
      results: [openaiResult],
      latency,
    });

  } catch (err) {
    console.error("❌ [multiService] Error:", err);
    // Expressのresでエラーレスポンスを返す
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
}
