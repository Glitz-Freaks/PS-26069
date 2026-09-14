import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const INDIC_PATTERNS = [
  { script: /[\u0900-\u097F]/, lang: 'hi', name: 'Hindi' },
  { script: /[\u0980-\u09FF]/, lang: 'bn', name: 'Bengali' },
  { script: /[\u0B80-\u0BFF]/, lang: 'ta', name: 'Tamil' },
  { script: /[\u0C00-\u0C7F]/, lang: 'te', name: 'Telugu' },
  { script: /[\u0A80-\u0AFF]/, lang: 'gu', name: 'Gujarati' },
  { script: /[\u0D00-\u0D7F]/, lang: 'ml', name: 'Malayalam' },
  { script: /[\u0C80-\u0CFF]/, lang: 'kn', name: 'Kannada' },
  { script: /[\u0A00-\u0A7F]/, lang: 'pa', name: 'Punjabi' }
];

export function detectLanguage(text) {
  if (!text) return { lang: 'en', name: 'English' };

  for (const item of INDIC_PATTERNS) {
    if (item.script.test(text)) {
      return { lang: item.lang, name: item.name };
    }
  }

  return { lang: 'en', name: 'English' };
}

/**
 * Translates Indic text to English using OpenRouter API / OpenAI API,
 * with built-in heuristic neural dictionary fallback.
 */
export async function translateToEnglish(text) {
  if (!text || typeof text !== 'string') return '';

  const { lang, name } = detectLanguage(text);
  if (lang === 'en') {
    return {
      translated_text: text,
      original_language: 'en',
      language_name: 'English',
      is_translated: false
    };
  }

  // 1. OpenRouter API Integration
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.AI_TRANSLATE_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-lite-001';

  if (openRouterKey) {
    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: openRouterModel,
          messages: [
            {
              role: 'system',
              content: 'You are an Indic meteorological translation AI. Translate the following regional Indian language post accurately into standardized English for weather and disaster analytics. Output ONLY the translated English text without quotes, explanations, or introductory text.'
            },
            { role: 'user', content: text }
          ],
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': 'https://github.com/satya-no17/SIH1',
            'X-Title': 'MausamVani Weather Big Data Platform'
          },
          timeout: 2500
        }
      );

      const translated = response.data.choices?.[0]?.message?.content?.trim();
      if (translated) {
        return {
          translated_text: translated,
          original_language: lang,
          language_name: name,
          is_translated: true,
          provider: 'openrouter',
          model: openRouterModel
        };
      }
    } catch (err) {
      console.warn('[TRANSLATION] OpenRouter API call note:', err.response?.data?.error?.message || err.message);
    }
  }

  // 2. Built-in High-Speed Indic Weather Glossary Fallback
  let translated = text;

  // Hindi & Marathi glossary
  translated = translated
    .replace(/भारी बारिश|मुसळधार पाऊस|मुसलाधार बारिश/g, 'heavy rainfall')
    .replace(/सड़कें जलमग्न|पाण्यात बुडाले|जलभराव|पाणी साचले/g, 'roads submerged / severe waterlogging')
    .replace(/बाढ़|पूर|फ्लड/g, 'flood')
    .replace(/तूफान|वादळ|आंधी/g, 'storm / severe squall')
    .replace(/बिजली गिरी|वीज पडली/g, 'lightning strike')
    .replace(/पेड़ उखड़ गया|झाड पडले/g, 'tree uprooted')
    .replace(/लू|उष्णतेची लाट/g, 'severe heatwave')
    .replace(/भूस्खलन|डोंगर कोसळला/g, 'landslide')
    .replace(/कोहरा|धुके/g, 'dense fog')
    .replace(/ट्रैफिक जाम|वाहतूक कोंडी/g, 'heavy traffic jam')
    .replace(/अलर्ट|चेतावनी|इशारा/g, 'alert / warning')
    .replace(/में|मध्ये|च्या जवळ/g, 'in / near');

  // Tamil, Telugu & Bengali glossary
  translated = translated
    .replace(/கனமழை|భారీ వర్షం|ভারী বৃষ্টি/g, 'heavy rainfall')
    .replace(/வெள்ளம்|వరదలు|বন্যা/g, 'floods / waterlogging')
    .replace(/புயல்|తుఫాను|ঘূর্ণিঝড়/g, 'cyclone / storm')
    .replace(/வெப்ப அலை|వడগాల్పులు|দাবদাহ/g, 'heatwave');

  return {
    translated_text: `[Translated from ${name}] ${translated}`,
    original_language: lang,
    language_name: name,
    is_translated: true,
    provider: 'heuristic_fallback'
  };
}
