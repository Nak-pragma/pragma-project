/**
 * ==========================================================
 *  multiService.js
 *  ✅ 現在は OpenAI 専用（将来 Claude / Gemini 追加を想定）
 * ==========================================================
 */

import { handleOpenAIChat } from "./openaiService.js";

/**
 * Compare responses across multiple AI providers.
 * 現段階では OpenAI のみを呼び出します。
 */
export async function compareResponses(req, res) {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Missing prompt text." });
  }

  try {
    console.log("🔹 [multiService] Received prompt:", prompt);
    const start = Date.now();

    // ---- 現在は OpenAI のみ ----
    const openaiResult = await handleOpenAIChat(prompt, true);

    const end = Date.now();
    const latency = `${end - start}ms`;

    console.log("✅ [multiService] OpenAI response OK:", latency);

    // ---- 結果を配列構造で返す（将来の拡張を考慮）----
    res.json({
      prompt,
      results: [openaiResult],
      latency,
    });
  } catch (err) {
    console.error("❌ [multiService] Error:", err);
    res.status(500).json({ error: err.message || "Unknown error" });
  }
}
