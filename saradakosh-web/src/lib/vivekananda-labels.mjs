// Imported headings can begin with a date, not just an ordinal number.
// Preserve "10, 11 Sept 1893" and "12 - 27 Sept 1893" in the timeline.
const dayDatePrefix = /^\d{1,2}(?:\s*[,\-–]\s*\d{1,2})?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t|tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b/i;

export function stripTimelineOrdinal(label) {
  if (typeof label !== 'string') return label;
  const text = label.trim();
  return dayDatePrefix.test(text) ? text : text.replace(/^\d+\s+/, '');
}

// Correct known imported heading errors without mutating the read-only DB.
export function correctVivekanandaTimelineDate(label) {
  if (typeof label !== 'string') return label;
  if (/America:\s*East\s+coast/i.test(label)) {
    return label.replace(/\b1999\b/g, '1899');
  }
  if (/America:\s*West\s+coast/i.test(label)) {
    return label.replace(/\bDec\s+99(?=\s*[-–])/i, 'Dec 1899');
  }
  return label;
}
