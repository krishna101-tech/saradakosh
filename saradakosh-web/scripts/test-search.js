async function run() {
  console.log('Dynamically importing embeddings library...');
  const { generateQueryEmbedding, ensureCacheLoaded, searchInMemoryVectors } = await import('../src/lib/embeddings.js');
  const Database = require('better-sqlite3');
  const path = require('path');
  
  const dbPath = path.resolve(__dirname, '../saradakosh.db');
  console.log('Connecting to database:', dbPath);
  const db = new Database(dbPath, { readonly: true });

  const query = "spiritual travel";
  console.log(`\nTesting semantic search for: "${query}"`);
  
  const vector = await generateQueryEmbedding(query);
  console.log('Query embedding generated successfully.');

  console.log('Performing vector similarity search...');
  const results = searchInMemoryVectors(vector, 5);
  
  console.log('\nTop 5 Semantic Matches:');
  for (const res of results) {
    const event = db.prepare('SELECT du, yr, mn, dt FROM events WHERE id = ?').get(res.id);
    console.log(`\n[ID ${res.id}] [Similarity: ${(res.score * 100).toFixed(1)}%]`);
    console.log(`Date: ${event?.dt}/${event?.mn}/${event?.yr}`);
    console.log(`Content: ${event?.du}`);
  }
  
  db.close();
}

run().catch(console.error);
