'use server';

import { getEventsByDate, searchEvents } from '@/lib/db';

export async function fetchTodayEvents(month, day) {
  return getEventsByDate(month, day);
}

export async function fetchSearchResults(term) {
  if (!term || term.length < 3) return [];
  return searchEvents(term);
}
