(() => {
  "use strict";

  const RENDER_API = "https://pragma-project.onrender.com/assist/multi/compare";
  const PROMPT_FIELD = "prompt";
  const TABLE_FIELD = "ai_results";
  const SPACE_FIELD = "chat_space";

  // ===== Markdownロード =====
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
      }),
    ]);
  };

  const renderMarkdown = (text) => {
    if (!window.marked || !window.DOMPurify) return text;
    return DOMPurify.sanitize(marked.parse(text || ""));
  };

  // ===== 編集モードイベント =====
  kintone.events.on("app.record.edit.show", async (event) => {
    const record = event.record;
    await loadMarked();

    // --- スペース要素取得 ---
    let space = kintone.app.record.getSpaceElement(SPACE_FIELD);
    if (!space) {
      console.warn("⚠️ スペースフィールドが見つかりません。");
      return event;
    }

    space.innerHTML = "";

    // --- 入力欄 ---
    const input = document.createElement("textarea");
    input.placeholder = "ここに質問を入力...";
    input.style =
      "width:100%;height:80px;margin-bottom:8px;padding:6px;border:1px solid #ccc;border-radius:6px;font-size:14px;resize:vertical;";
    space.appendChild(input);

    if (record[PROMPT_FIELD].value) input.value = record[PROMPT_FIELD].value;

    // --- 実行ボタン ---
    const btn = document.createElement("button");
    btn.textContent = "💬 AI応答を取得（OpenAI）";
    btn.style =
      "background:#4472C4;color:#fff;padding:6px 12px;border:none;border-radius:6px;margin-bottom:12px;cursor:pointer;";
    space.appendChild(btn);

    // --- 結果表示 ---
    const resultDiv = document.createElement("div");
    resultDiv.style = `
      background:#f7f8fa;border-radius:8px;padding:12px;
      font-family:system-ui,sans-serif;line-height:1.6;
      white-space:normal;color:#222;overflow-wrap:break-word;
      box-shadow:0 1px 3px rgba(0,0,0,0.1);
    `;
    space.appendChild(resultDiv);

    // --- ボタンクリックイベント ---
    btn.onclick = async () => {
      const prompt = input.value.trim();
      if (!prompt) {
        alert("質問を入力してください。");
        return;
      }

      btn.disabled = true;
      btn.textContent = "⏳ 実行中...";

      try {
        const res = await fetch(RENDER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();

        if (!data.results || !Array.isArray(data.results)) {
          throw new Error("応答が不正です。");
        }

        const result = data.results[0];
        resultDiv.innerHTML = renderMarkdown(result.content);

        // ✅ kintoneのレコードに反映（保存可能）
        record[PROMPT_FIELD].value = prompt;

        record[TABLE_FIELD].value = [
          {
            value: {
              provider: { value: result.provider || "OpenAI" },
              model: { value: result.model || "gpt-4o-mini" },
              content: { value: result.content || "" },
              latency: { value: result.duration ? result.duration.replace("ms", "") : "" },
            },
          },
        ];

        console.log("✅ レコードへ反映:", record[TABLE_FIELD].value);
        alert("✅ AI応答を取得しました。保存すると反映されます。");
      } catch (err) {
        console.error("❌ Fetch Error:", err);
        alert("❌ エラー: " + err.message);
      } finally {
        btn.disabled = false;
        btn.textContent = "💬 AI応答を取得（OpenAI）";
      }
    };

    return event;
  });
})();
