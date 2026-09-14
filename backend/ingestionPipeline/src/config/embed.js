import { pipeline } from "@huggingface/transformers";
import dotenv from 'dotenv'

dotenv.config()
const model = process.env.MODEL

let embedder = null

async function loadEmbedder() {
    if (!embedder) {
        console.log('loading embedding model (first call only, may take a few seconds)...');
        embedder = await pipeline('feature-extraction', model);
    }
    return embedder

}

export async function embedBatch(texts) {
  const model = await loadEmbedder();
  const output = await model(texts, { pooling: 'mean', normalize: true });
  return output.tolist(); 
}