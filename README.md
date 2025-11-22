# Kintone × OpenAI Assistants × Google Drive Integration Server

**（kintone
内で連続チャット・資料要約・Drive自動保存を実現する統合サーバー）**

本プロジェクトは、\
**kintone アプリ → Render（Node.js）→ OpenAI Assistants → Google
Drive（OAuth）**\
を接続し、以下をすべて自動化する統合システムです。

-   kintone 内で ChatGPT と連続チャット（Thread）
-   添付資料を OpenAI に送信 → 要約生成 → kintone 保存
-   添付ファイルを Google Drive へ自動アップロード
-   OpenAI VectorStore にファイルを格納（高度な検索/要約）
-   すべてのデータが kintone レコードに紐づいて保持される

------------------------------------------------------------------------

# 1. 🧩 システム構成

    kintone（フロント JS）
     └─ send message
         └→ server.js（Render）
              ├ Assistants API（Threads / Messages / Runs）
              ├ VectorStore（ファイル保存）
              ├ Google Drive API（OAuth）
              ├ kintone REST API
              └→ result HTML → kintone 保存

------------------------------------------------------------------------

# 2. 🏗 技術スタック

-   Node.js + Express\
-   OpenAI Assistants API\
-   Google Drive API\
-   kintone REST API\
-   Render\
-   GitHub\
-   カスタム kintone JS

------------------------------------------------------------------------

# 3. 📁 ディレクトリ構成（推奨）

    /
    ├ server.js
    ├ package.json
    ├ /kintone/
    │   └ chat-ui.js
    ├ /docs/
    │   └ sequence.md
    └ README.md

------------------------------------------------------------------------

# 4. 🔧 必須環境変数（Render に設定）

    OPENAI_API_KEY
    OPENAI_ASSISTANT_ID
    KINTONE_DOMAIN
    KINTONE_API_TOKEN
    KINTONE_DOCUMENT_APP_ID
    KINTONE_DOCUMENT_TOKEN
    GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET

------------------------------------------------------------------------

# 5. 🚦 kintone 側の要件

## ■ 必要フィールド

  フィールド名   コード
  -------------- -----------
  Thread ID      thread_id
  Chat HTML      chat_html
  Files          files

------------------------------------------------------------------------

# 6. 🧠 Assistants API フロー

1.  thread_id を生成または取得\
2.  message を追加\
3.  run 実行\
4.  完了まで待機\
5.  出力HTMLを保存\
6.  添付資料は VectorStore に格納

------------------------------------------------------------------------

# 7. ☁ Google Drive（OAuth）

-   /google/auth で許可画面へ\
-   /oauth2callback で tokens を取得\
-   refresh_token を kintone に保存\
-   Drive へ自動アップロード

------------------------------------------------------------------------

# 8. 🔥 server.js で実装すべき機能

-   Express サーバー\
-   kintone API\
-   Assistants API\
-   Drive OAuth\
-   VectorStore\
-   Thread管理\
-   HTML保存\
-   /assist/thread-chat\
-   /google/auth\
-   /oauth2callback

------------------------------------------------------------------------

# 9. 🧪 Copilot への指示

-   README に基づいて server.js を生成\
-   chat-ui.js を生成\
-   Drive アップロード関数の Jest テストを生成

------------------------------------------------------------------------

# 作成：Noa（ChatGPT）
