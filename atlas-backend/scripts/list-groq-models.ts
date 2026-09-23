import { Groq } from 'groq-sdk';
import * as dotenv from 'dotenv';
dotenv.config();

async function getModels() {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const response = await groq.models.list();
  console.log(response.data.map(m => m.id));
}

getModels();
