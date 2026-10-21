'use server';

import { getEventsByDate, searchEvents } from '@/lib/db';

export async function fetchTodayEvents(month, day) {
  return getEventsByDate(month, day);
}

export async function fetchEventChildrenAction(parentId) {
  const { getEventChildren } = await import('@/lib/db');
  return getEventChildren(parentId);
}

export async function fetchSearchResults(term) {
  if (!term || typeof term !== 'string') return [];
  
  const cleanTerm = term.slice(0, 50).trim();
  if (cleanTerm.length < 3) return [];

  // The canonical database has no vector index. Use its keyword search directly;
  // searchEvents also preserves the empty-result fallback on database errors.
  return searchEvents(cleanTerm, 50).map(doc => ({ ...doc, isTextMatch: true }));
}
