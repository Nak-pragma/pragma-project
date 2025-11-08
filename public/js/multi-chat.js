(() => {
  "use strict";

  // ===============================
  // 設定
  // ===============================
  const RENDER_API = "https://pragma-project.onrender.com/assist/multi/compare";
  const PROMPT_FIELD = "prompt";
  const TABLE_FIELD = "ai_results";
  const SPACE_FIELD = "chat_space"; // Markdown表示エリア

  // ===============================
  // Markdown表示用ライブラリ読み込み
  // ===============================
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

  // ===============================
  // Markdownレンダリング関数
  // ===============================
  function renderMarkdown(mdText) {
    if (!window.marked || !window.DOMPurify) return mdText;
    const rawHtml = marked.parse(mdText || "");
    return DOMPurify.sanitize(rawHtml);
  }

  // ===============================
  // レコード詳細画面処理
  // ===============================
  kintone.events.on("app.record.detail.show", async (event) => {
    const record = event.record;
    await loadMarked();

    // --- ボタン設置 ---
    const mySpace = kintone.app.record.getSpaceElement(SPACE_FIELD);
    mySpace.innerHTML = "";
    const button = document.createElement("button");
    button.textContent = "💬 AI応答を取得";
    button.style = "background:#4472C4;color:white;padding:6px 12px;border:none;border-radius:6px;margin-bottom:12px;";
    mySpace.appendChild(button);

    // --- 表示領域 ---
    const resultDiv = document.createElement("div");
    resultDiv.style = `
      font-family: system-ui, sans-serif;
      background: #f7f8fa;
      border-radius: 10px;
      padding: 16px;
      line-height: 1.6;
      color: #222;
      white-space: normal;
      overflow-wrap: break-word;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    `;
    mySpace.appendChild(resultDiv);

    // --- Markdownスタイルを少し整える（Web版風） ---
    const style = document.createElement("style");
    style.textContent = `
      .chat-markdown code {
        background: #f2f2f2;
        border-radius: 4px;
        padding: 2px 4px;
        font-family: monospace;
      }
      .chat-markdown pre {
        background: #1e1e1e;
        color: #e2e2e2;
        padding: 10px;
        border-radius: 6px;
        overflow-x: auto;
      }
      .chat-markdown blockquote {
        border-left: 4px solid #ddd;
        padding-left: 10px;
        color: #555;
        margin: 8px 0;
      }
      .chat-markdown table {
        border-collapse: collapse;
        margin: 8px 0;
      }
      .chat-markdown th, .chat-markdown td {
        border: 1px solid #ccc;
        padding: 4px 8px;
      }
      .chat-markdown ul {
        margin-left: 20px;
      }
      .chat-markdown a {
        color: #4472C4;
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);

    // --- ボタンクリック処理 ---
    button.onclick = async () => {
      const prompt = record[PROMPT_FIELD].value;
      if (!prompt) return alert("質問を入力してください。");

      button.disabled = true;
      button.textContent = "⏳ 実行中...";

      try {
        const res = await fetch(RENDER_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();

        // --- テーブル更新 ---
        record[TABLE_FIELD].value = data.results.map(r => ({
          value: {
            provider: { value: r.provider },
            model: { value: r.model },
            content: { value: r.content },
            latency: { value: r.duration.replace("ms", "") }
          }
        }));

        // --- Markdown表示（OpenAI結果1件） ---
        const md = data.results[0].content || "";
        resultDiv.className = "chat-markdown";
        resultDiv.innerHTML = renderMarkdown(md);

        // --- 実行日時更新 ---
        record.executed_at.value = new Date().toISOString();

        // --- kintone保存 ---
        await kintone.api(kintone.api.url("/k/v1/record", true), "PUT", {
          app: kintone.app.getId(),
          id: record.$id.value,
          record
        });

      } catch (err) {
        console.error(err);
        alert("❌ エラーが発生しました: " + err.message);
      } finally {
        button.disabled = false;
        button.textContent = "💬 AI応答を取得";
      }
    };

    // --- 既存データ表示（再表示時用） ---
    if (record[TABLE_FIELD].value.length > 0) {
      const md = record[TABLE_FIELD].value[0].value.content.value;
      resultDiv.className = "chat-markdown";
      resultDiv.innerHTML = renderMarkdown(md);
    }

    return event;
  });
})();
