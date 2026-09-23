import { Groq } from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

async function testGroq() {
  console.log('[INFO] Menguji koneksi Groq API...');
  
  if (!process.env.GROQ_API_KEY) {
    console.error('[ERROR] GROQ_API_KEY tidak ditemukan di .env');
    process.exit(1);
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const model = 'qwen/qwen3.8-27b';

  try {
    console.log(`[INFO] Mengirim request ke model: ${model}...`);
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Halo Groq! Ini adalah tes koneksi dari Atlas Backend. Tolong balas dengan singkat.',
        },
      ],
      model: model,
      max_tokens: 50,
    });

    console.log('\n✅ [SUKSES] Respon dari Groq:');
    console.log('--------------------------------------------------');
    console.log(response.choices[0]?.message?.content);
    console.log('--------------------------------------------------');
    console.log('\nSilakan refresh halaman dashboard Groq kamu, "API Calls" seharusnya akan bertambah menjadi 1.');
  } catch (error: any) {
    console.error('\n❌ [GAGAL] Terjadi kesalahan saat memanggil Groq:');
    console.error(error.message || error);
  }
}

testGroq();
