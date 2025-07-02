// ===========================
// server.js
// ===========================

require("dotenv").config(); // .envを最初に読み込む

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch"); // node-fetch v2 を使用
const textToSpeech = require("@google-cloud/text-to-speech");

const app = express();
const port = process.env.PORT || 3000; // ← Render用にPORT対応
const client = new textToSpeech.TextToSpeechClient();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// ===========================
// 翻訳APIエンドポイント
// ===========================
app.post("/translate", async (req, res) => {
  const { q, target } = req.body;

  if (!q || !target) {
    return res.status(400).json({ error: "Missing 'q' or 'target'." });
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, target, format: "text" }),
      }
    );

    const result = await response.json();

    if (!result.data || !result.data.translations) {
      throw new Error("Invalid response from Google Translate API");
    }

    const translatedText = result.data.translations[0].translatedText;
    console.log("✅ 翻訳成功:", translatedText);
    res.json({ translatedText });
  } catch (err) {
    console.error("❌ 翻訳失敗:", err.message || err);
    res.status(500).json({ error: "Translation failed." });
  }
});

// ===========================
// 音声合成APIエンドポイント
// ===========================
app.get("/speak", async (req, res) => {
  const text = req.query.s;
  if (!text) return res.status(400).send("Text is required.");

  const request = {
    input: { text },
    voice: { languageCode: "ja-JP", ssmlGender: "NEUTRAL" },
    audioConfig: { audioEncoding: "MP3" },
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    res.set("Content-Type", "audio/mpeg");
    res.send(response.audioContent);
  } catch (err) {
    console.error("❌ Google TTS エラー:", err.message || err);
    res.status(500).send("TTS failed");
  }
});

// ===========================
// サーバー起動
// ===========================
app.listen(port, () => {
  console.log(`✅ サーバー起動中 on port ${port}`);
});
