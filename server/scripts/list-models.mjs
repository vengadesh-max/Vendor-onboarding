import { loadEnv } from '../src/config/env.js';
loadEnv();

const apiKey = process.env.GEMINI_API_KEY?.trim();
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

try {
  const res = await fetch(url);
  const data = await res.json();
  if (data.models) {
    console.log('Available models for this API key:');
    data.models
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .forEach((m) => console.log(' -', m.name));
  } else {
    console.log('API response:', JSON.stringify(data));
  }
} catch (err) {
  console.error('Fetch failed:', err.message);
}
