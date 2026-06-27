const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../saradakosh.db');
console.log('Connecting to database at:', dbPath);
const db = new Database(dbPath);

// Ensure event_embeddings table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS event_embeddings (
    event_id INTEGER PRIMARY KEY,
    embedding BLOB,
    FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE
  );
`);

async function run() {
  console.log('Loading embedding model (all-MiniLM-L6-v2)...');
  const { pipeline } = await import('@huggingface/transformers');
  
  // Initialize the pipeline
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  console.log('Model loaded successfully.');

  // Fetch all events that don't have embeddings and have a non-empty description
  const events = db.prepare(`
    SELECT id, du FROM events 
    WHERE (child_id IS NULL OR child_id = '') 
      AND du IS NOT NULL 
      AND TRIM(du) != ''
      AND id NOT IN (SELECT event_id FROM event_embeddings)
  `).all();

  console.log(`Found ${events.length} events needing embeddings.`);
  if (events.length === 0) {
    console.log('All embeddings are up to date!');
    return;
  }

  // Generate and insert embeddings in batches
  const insertStmt = db.prepare('INSERT OR REPLACE INTO event_embeddings (event_id, embedding) VALUES (?, ?)');
  
  let count = 0;
  const batchSize = 50; // Smaller batch size to prevent overloading CPU/memory
  
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    
    const promises = batch.map(async (event) => {
      try {
        // Clean text (remove excessive whitespaces and newlines)
        const text = event.du.replace(/\s+/g, ' ').trim();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
        // Ensure we create a clean Float32Array
        const floatArray = new Float32Array(output.data);
        const buffer = Buffer.from(floatArray.buffer, floatArray.byteOffset, floatArray.byteLength);
        
        return { id: event.id, buffer };
      } catch (err) {
        console.error(`Error embedding event ${event.id}:`, err);
        return null;
      }
    });

    const results = await Promise.all(promises);
    
    // Save to DB inside a transaction
    db.transaction(() => {
      for (const res of results) {
        if (res) {
          insertStmt.run(res.id, res.buffer);
          count++;
        }
      }
    })();

    console.log(`Progress: ${count}/${events.length} embeddings generated & saved.`);
  }

  console.log('Embedding sync complete successfully!');
}

run().catch(console.error);
