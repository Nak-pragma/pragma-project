import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function handleOpenAIChat(prompt, direct = false) {
  const start = Date.now();
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const duration = `${Date.now() - start}ms`;
  const content = completion.choices[0].message.content;

  const result = {
    provider: "OpenAI",
    model: "gpt-4o-mini",
    content,
    duration,
  };

  // directモードではresultを返すだけ
  if (direct) return result;
}
