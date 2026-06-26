'use server';

import { getEventsByDate, searchEvents } from '@/lib/db';

export async function fetchTodayEvents(month, day) {
  return getEventsByDate(month, day);
}

export async function fetchSearchResults(term) {
  if (!term || typeof term !== 'string') return [];
  
  // Basic sanitization and length limit to prevent resource exhaustion
  const cleanTerm = term.slice(0, 50).trim();
  if (cleanTerm.length < 3) return [];
  
  return searchEvents(cleanTerm);
}
