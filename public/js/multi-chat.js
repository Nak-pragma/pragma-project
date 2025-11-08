(() => {
  "use strict";

  const RENDER_API = "https://pragma-project.onrender.com/assist/multi/compare";
  const PROMPT_FIELD = "prompt";
  const TABLE_FIELD = "ai_results";
  const SPACE_FIELD = "chat_space";

  // ----------------------------
  // marked + DOMPurify ロード
  // ----------------------------
  const loadMarked = async () => {
    if (window.marked && window.DOMPurify) return;
    await Promise.all([
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      }),
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/dompurify@3.1.6/dist/purify.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      })
    ]);
  };

  const renderMarkdown = (text) => {
    if (!window.marked || !window.DOMPurify) return text;
    return DOMPurify.sanitize(marked.parse(text || ""));
  };

  // ----------------------------
  // 編集モードでボタン表示
  // ----------------------------
  kintone.events.on("app.record.edit.show", async (event) => {
    const record = event.record;
    await loadMarked();

    const space = kintone.app.record.getSpaceElement(SPACE_FIELD);
    if (!space) return event;
    space.innerHTML = "";

    // 実行ボタン
    const btn = document.createElement("button");
    btn.textContent = "💬 AI応答を取得（OpenAI）";
    btn.style = "background:#4472C4;color:#fff;padding:6px 12px;border:none;border-radius:6px;margin-bottom:12px;";
    space.appendChild(btn);

    // 結果表示エリア
    const resultDiv = document.createElement("div");
    resultDiv.style = `
      background:#f7f8fa;border-radius:8px;padding:12px;
      font-family:system-ui,sans-serif;line-height:1.6;white-space:normal;
      color:#222;overflow-wrap:break-word;box-shadow:0 1px 3px rgba(0,0,0,0.1);
    `;
    space.appendChild(resultDiv);

    btn.onclick = async () => {
      const prompt = record[PROMPT_FIELD].value;
      if (!prompt) return alert("質問を入力してください。");

      btn.disabled = true;
      btn.textContent = "⏳ 実行中...";

      try {
        const res = await fetch(RENDER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });

        const data = await res.json();
        if (!data.results || !Array.isArray(data.results)) throw new Error("応答が不正です。");

        // OpenAI応答（Markdown）
        const result = data.results[0];
        resultDiv.innerHTML = renderMarkdown(result.content);

        // テーブルへ自動反映
        record[TABLE_FIELD].value = [
          {
            value: {
              provider: { value: result.provider },
              model: { value: result.model },
              content: { value: result.content },
              latency: { value: result.duration.replace("ms", "") }
            }
          }
        ];

        alert("✅ AI応答を取得しました。内容を確認して保存できます。");
      } catch (err) {
        console.error(err);
        alert("❌ エラー: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "💬 AI応答を取得（OpenAI）";
      }
    };

    return event;
  });
})();
