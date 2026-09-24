import { getConfig } from '../config/env.js';

function stripMarkdownFences(text) {
  let t = (text || '').trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return t.trim();
}

export function parseJsonFromLlm(content, fallback) {
  try {
    return JSON.parse(stripMarkdownFences(content));
  } catch {
    return fallback;
  }
}

let lastCallAt = 0;

async function waitForRateLimit(minIntervalMs = 1000) {
  const elapsed = Date.now() - lastCallAt;
  if (elapsed < minIntervalMs) {
    await new Promise((r) => setTimeout(r, minIntervalMs - elapsed));
  }
  lastCallAt = Date.now();
}

export function isGeminiConfigured() {
  getConfig();
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export async function chatCompletion(systemPrompt, userPrompt, options = {}) {
  const { gemini } = getConfig();
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const temperature = options.temperature ?? 0.2;
  const model = options.model || gemini.model || 'gemini-3.6-flash';
  const timeoutMs = options.timeoutMs || 3500;

  const url = `${gemini.base}/models/${model}:generateContent?key=${apiKey}`;
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature,
    },
  };

  if (options.jsonMode !== false && options.jsonOutput !== false) {
    requestBody.generationConfig.responseMimeType = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API ${response.status}: ${body.slice(0, 100)}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) throw new Error('Empty response from Gemini');
    return content;
  } catch (err) {
    clearTimeout(timeoutId);
    const msg = err.name === 'AbortError' ? `Gemini API timed out after ${timeoutMs}ms` : err.message;
    console.warn(`[Gemini API] Call failed (${msg}). Using fallback.`);
    throw new Error(msg);
  }
}

export async function generateContent(systemPrompt, userPrompt, options = {}) {
  return chatCompletion(systemPrompt, userPrompt, options);
}
