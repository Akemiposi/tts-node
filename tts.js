// tts-node/tts.js
require('dotenv').config();
const fs = require('fs');
const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient();

async function quickStart() {
  const request = {
    input: { text: 'こんにちは。これはテストです。' },
    voice: { languageCode: 'ja-JP', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  const [response] = await client.synthesizeSpeech(request);
  fs.writeFileSync('output.mp3', response.audioContent, 'binary');
  console.log('✅ 音声ファイル output.mp3 を作成しました');
}

quickStart();