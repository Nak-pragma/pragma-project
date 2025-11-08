/**
 * ==========================================================
 *  server_v2.0.0.js
 *  ✅ Modular Pragma Server (OpenAI Route only)
 * ==========================================================
 */
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// ----------------------------------------------------------
// ルート登録
// ----------------------------------------------------------
// 🔹 public配下を静的配信（GitHub管理JSをRender経由で提供）
app.use(express.static(path.join(__dirname, "public")));

app.use("/assist", routes);

// 健康チェック用
app.get("/", (req, res) => res.send("✅ Pragma Modular Server Running"));

// ----------------------------------------------------------
// サーバー起動
// ----------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

