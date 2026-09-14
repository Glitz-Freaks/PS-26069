import { pipeline } from '@huggingface/transformers';
import dotenv from 'dotenv';
dotenv.config();

const MODEL_NAME = process.env.MODEL || 'Xenova/bge-small-en-v1.5';
let extractorInstance = null;

export async function getExtractor() {
  if (!extractorInstance) {
    try {
      console.log(`[EMBEDDING] Initializing HuggingFace ONNX pipeline with model: ${MODEL_NAME}...`);
      extractorInstance = await pipeline('feature-extraction', MODEL_NAME);
      console.log('[EMBEDDING] ONNX Feature extraction pipeline ready.');
    } catch (err) {
      console.warn('[EMBEDDING WARNING] Could not load ONNX model directly, using normalized semantic hashing fallback:', err.message);
      extractorInstance = createFallbackExtractor();
    }
  }
  return extractorInstance;
}

export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') {
    return new Array(384).fill(0);
  }

  try {
    const extractor = await getExtractor();
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.warn('[EMBEDDING] Generating deterministic vector fallback for text:', err.message);
    return generateDeterministicVector(text);
  }
}

/**
 * Deterministic 384-dim pseudo-vector generator for resilient offline fallback
 */
function generateDeterministicVector(text) {
  const vec = new Array(384).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = (charCode * (i + 1)) % 384;
    vec[index] += Math.sin(charCode + i);
  }
  // Normalize vector
  let norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm === 0) norm = 1;
  return vec.map(v => Number((v / norm).toFixed(6)));
}

function createFallbackExtractor() {
  return async function fallbackExtractor(text) {
    const data = generateDeterministicVector(text);
    return { data };
  };
}
