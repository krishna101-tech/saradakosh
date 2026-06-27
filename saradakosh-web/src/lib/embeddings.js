import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Cache structure
const cache = {
  eventIds: [],
  embeddings: null, // Float32Array of size N * 384
  count: 0,
  mtimeMs: 0
};

const dbPath = path.resolve(process.cwd(), 'saradakosh.db');

// Helper to load cache from database
function loadCache(newMtimeMs) {
  try {
    console.log('[Embeddings Cache] Loading/Reloading embeddings from database...');
    const db = new Database(dbPath, { readonly: true });
    
    // Check if table exists
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='event_embeddings'").get();
    if (!tableCheck) {
      console.warn('[Embeddings Cache] event_embeddings table does not exist yet.');
      cache.eventIds = [];
      cache.embeddings = new Float32Array(0);
      cache.count = 0;
      cache.mtimeMs = newMtimeMs;
      db.close();
      return;
    }

    const rows = db.prepare('SELECT event_id, embedding FROM event_embeddings').all();
    db.close();

    const count = rows.length;
    console.log(`[Embeddings Cache] Loading ${count} embeddings into memory.`);
    
    const eventIds = new Int32Array(count);
    const embeddings = new Float32Array(count * 384);

    for (let i = 0; i < count; i++) {
      const row = rows[i];
      eventIds[i] = row.event_id;
      
      // Convert SQLite BLOB Buffer to Float32Array
      const buffer = row.embedding;
      const floatArray = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
      
      embeddings.set(floatArray, i * 384);
    }

    cache.eventIds = eventIds;
    cache.embeddings = embeddings;
    cache.count = count;
    cache.mtimeMs = newMtimeMs;
    console.log('[Embeddings Cache] Embedding cache loaded successfully.');
  } catch (error) {
    console.error('[Embeddings Cache] Error loading embeddings cache:', error);
  }
}

// Function to verify and reload if db changed
export function ensureCacheLoaded() {
  try {
    if (!fs.existsSync(dbPath)) return;
    const stats = fs.statSync(dbPath);
    if (stats.mtimeMs !== cache.mtimeMs) {
      loadCache(stats.mtimeMs);
    }
  } catch (err) {
    console.error('[Embeddings Cache] Error checking database modification time:', err);
  }
}

// In-Memory Dot Product search
export function searchInMemoryVectors(queryVector, limit = 50) {
  ensureCacheLoaded();
  
  if (cache.count === 0 || !cache.embeddings) {
    return [];
  }

  const results = [];
  const count = cache.count;
  const embeddings = cache.embeddings;
  const eventIds = cache.eventIds;

  for (let i = 0; i < count; i++) {
    const offset = i * 384;
    let dotProduct = 0;
    
    // Dot product (vectors are normalized so this equals cosine similarity)
    for (let j = 0; j < 384; j++) {
      dotProduct += queryVector[j] * embeddings[offset + j];
    }
    
    results.push({ id: eventIds[i], score: dotProduct });
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

// Lazy-loaded model pipeline for query embedding
let extractorPromise = null;

async function getExtractor() {
  if (!extractorPromise) {
    console.log('[Model Loader] Initializing local embedding pipeline (all-MiniLM-L6-v2)...');
    const { pipeline } = await import('@huggingface/transformers');
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorPromise;
}

export async function generateQueryEmbedding(queryText) {
  try {
    const extractor = await getExtractor();
    const cleanText = queryText.replace(/\s+/g, ' ').trim();
    const output = await extractor(cleanText, { pooling: 'mean', normalize: true });
    
    // Return standard array of floats
    return Array.from(output.data);
  } catch (error) {
    console.error('[Embedding Generation] Error generating query embedding:', error);
    throw error;
  }
}
