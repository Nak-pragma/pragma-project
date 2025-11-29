// server_poc.js MVP version (Render-ready)

import express from "express";
import OpenAI from "openai";
import cors from "cors";
import fileUpload from "express-fileupload";
import xlsx from "xlsx";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(fileUpload());

// ======================
// OpenAI Chat API (既存)
// ======================
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const defaultModel = "gpt-4o-mini";

app.post("/mvp/thread-chat", async (req, res) => {
  try {
    const model = req.body.model || defaultModel;
    const messages = req.body.messages || [];

    const completion = await client.chat.completions.create({
      model,
      messages,
      max_tokens: 2000
    });

    res.json({ result: completion.choices[0].message });
  } catch (e) {
    console.error("[Error] /mvp/thread-chat:", e);
    res.status(500).json({ error: e.message });
  }
});


// =======================================================
// Excel → WBS_import 追加登録 API（新規追加）
// =======================================================

// Render 環境変数
const WBS_IMPORT_APP_ID = process.env.KINTONE_WBS_IMPORT_APP_ID;   // ★WBS_importアプリID
const KINTONE_DOMAIN    = process.env.KINTONE_DOMAIN;       // 例：xxxx.cybozu.com
const KINTONE_API_TOKEN = process.env.KINTONE_WBS_IMPORT_TOKEN;    // ★追加権限APIトークン

// ★ ExcelからWBS_importへデータ追加登録
app.post("/excel/import", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "Excel file is required (form field name: file)" });
    }

    const excelFile = req.files.file;

    // ---- Excel 読み込み ----
    const workbook = xlsx.read(excelFile.data, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 3) {
      return res.status(400).json({ error: "Excel must contain type-row, field-row, and data." });
    }

    // 1行目 → type
    const typeRow = rows[0];

    // 2行目 → field_code
    const fieldRow = rows[1];

    // 3行目以降 → データ
    const dataRows = rows.slice(2);

    // ---- Excel → kintone用レコードに変換 ----
    const records = dataRows.map(cols => {
      const rec = {};
      cols.forEach((val, colIdx) => {
        const type = typeRow[colIdx];
        const field = fieldRow[colIdx];
        rec[field] = convertValue(type, val);
      });
      return rec;
    });

    // ---- kintoneへ追加登録 ----
    const kintoneResp = await fetch(
      `https://${KINTONE_DOMAIN}/k/v1/records.json`,
      {
        method: "POST",
        headers: {
          "X-Cybozu-API-Token": KINTONE_API_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          app: WBS_IMPORT_APP_ID,
          records: records
        })
      }
    );

    const json = await kintoneResp.json();

    return res.json({
      status: "success",
      added: records.length,
      kintone: json
    });

  } catch (err) {
    console.error("[Error] /excel/import:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---- Excel type → kintone value ----
function convertValue(type, val) {
  if (val === undefined || val === null || val === "") {
    return { value: "" };
  }

  switch (type) {

    case "string":
      return { value: String(val) };

    case "number":
      return { value: Number(val) };

    case "date":
      if (typeof val === "number") {
        // Excel serial → YYYY-MM-DD
        const d = xlsx.SSF.parse_date_code(val);
        const dt = new Date(Date.UTC(d.y, d.m - 1, d.d));
        return { value: dt.toISOString().slice(0, 10) };
      }
      return { value: String(val) };

    case "datetime":

      // --- ① Excel serial (number) ---
      if (typeof val === "number") {
        const d = xlsx.SSF.parse_date_code(val);
        const dt = new Date(Date.UTC(d.y, d.m - 1, d.d, d.H, d.M, d.S));
        return { value: dt.toISOString() };
      }

      // --- ② 数字の文字列を serial として扱う ---
      if (!isNaN(val)) {
        const serial = Number(val);
        const d = xlsx.SSF.parse_date_code(serial);
        const dt = new Date(Date.UTC(d.y, d.m - 1, d.d, d.H, d.M, d.S));
        return { value: dt.toISOString() };
      }

      // --- ③ 通常の文字列datetimeとして扱う ---
      const dateObj = new Date(val);
      if (!isNaN(dateObj.getTime())) {
        return { value: dateObj.toISOString() };
      }

      // --- ④ それでも解釈できなければ空 ---
      return { value: "" };

    default:
      return { value: String(val) };
  }
}



// =============================
// Render 起動設定（既存）
// =============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MVP server running on port ${PORT}`);
});

export default app;
