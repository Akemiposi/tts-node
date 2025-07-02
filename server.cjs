// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");


dotenv.config();

const app = express(); // ← 一度だけに修正！
const port = 3000;
const client = new textToSpeech.TextToSpeechClient();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// 翻訳APIエンドポイント
app.post("/translate", async (req, res) => {
  const { q, target } = req.body;

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q,
          target,
          format: "text",
        }),
      }
    );

    const result = await response.json();
    console.log("✅ 翻訳成功:", result); // 翻訳内容を出力
    const translatedText = result.data.translations[0].translatedText;
    res.json({ translatedText });
  } catch (err) {
    const message = err?.response?.statusText || err?.message || err;
    console.error("❌ 翻訳失敗:", message, err);
    res.status(500).json({ error: "Translation failed." });
  }
});

// 音声合成APIエンドポイント
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
    console.error("❌ Google TTS エラー:", err);
    res.status(500).send("TTS failed");
  }
});

app.listen(port, () => {
  console.log(`✅ サーバー起動中: http://localhost:${port}`);
});
