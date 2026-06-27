'use server';

import { getEventsByDate, searchEvents, searchEventsVector } from '@/lib/db';
import { generateQueryEmbedding } from '@/lib/embeddings';

export async function fetchTodayEvents(month, day) {
  return getEventsByDate(month, day);
}

export async function fetchSearchResults(term) {
  if (!term || typeof term !== 'string') return [];
  
  const cleanTerm = term.slice(0, 50).trim();
  if (cleanTerm.length < 3) return [];
  
  try {
    // 1. Get plain text search results (LIKE query)
    const textResults = searchEvents(cleanTerm, 100);
    
    // 2. Generate vector embedding for the query
    const queryVector = await generateQueryEmbedding(cleanTerm);
    
    // 3. Get vector search results (local ONNX similarity)
    const vectorResults = searchEventsVector(queryVector, 100);
    
    // 4. Merge results using Reciprocal Rank Fusion (RRF)
    const k = 60; // constant parameter for RRF
    const scoreMap = new Map();
    const docMap = new Map();
    
    // Process text results
    textResults.forEach((doc, index) => {
      const rank = index + 1;
      const score = 1 / (k + rank);
      scoreMap.set(doc.id, score);
      docMap.set(doc.id, { ...doc, isTextMatch: true });
    });
    
    // Process vector results
    vectorResults.forEach((doc, index) => {
      const rank = index + 1;
      const score = 1 / (k + rank);
      
      if (scoreMap.has(doc.id)) {
        scoreMap.set(doc.id, scoreMap.get(doc.id) + score);
        docMap.get(doc.id).isVectorMatch = true;
        docMap.get(doc.id).similarityScore = doc.similarityScore;
      } else {
        scoreMap.set(doc.id, score);
        docMap.set(doc.id, { ...doc, isVectorMatch: true, similarityScore: doc.similarityScore });
      }
    });
    
    // Sort all documents by RRF score descending
    const mergedResults = Array.from(docMap.keys())
      .map(id => ({
        ...docMap.get(id),
        rrfScore: scoreMap.get(id)
      }))
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, 50); // limit to top 50
      
    return mergedResults;
  } catch (error) {
    console.error("Error in hybrid search:", error);
    // Fallback to plain text search if anything fails
    return searchEvents(cleanTerm, 50).map(doc => ({ ...doc, isTextMatch: true }));
  }
}
