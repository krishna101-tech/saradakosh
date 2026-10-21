export const CATEGORIES = [
  ['all', 'All books'], ['ramakrishna', 'Sri Ramakrishna'], ['sarada', 'Sri Sarada Devi'],
  ['vivekananda', 'Swami Vivekananda'], ['disciples', 'Disciples'], ['general', 'General'],
];
export const PAGE_SIZE = 24;

// Preserve the frozen source/SQLite ledger, while keeping a confirmed dead
// inherited target from being offered as a functioning reader. Client-specific
// 403s/timeouts are not enough to mark another source unavailable.
const UNAVAILABLE_READER = 'https://rkmlibrary.com/bookCnt.php?bookId=2&cptId=78&pct=469&ptid=809';

export function categoryFor(person) {
  return ({ 'Sri Ramakrishna': 'ramakrishna', 'Sri Sarada Devi': 'sarada', 'Swami Vivekananda': 'vivekananda', General: 'general' })[person] || 'disciples';
}

export function approvedCoverAsset(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && url.hostname === 'res.cloudinary.com' &&
      url.pathname.startsWith('/dljwhlvid/image/upload/') ? value : null;
  } catch { return null; }
}

export function resolveBookDisplay(book, mode = 'original') {
  const requested = mode === 'english' ? 'English' : mode === 'bengali' ? 'Bengali' : null;
  const translated = mode === 'english' ? book.english_title : mode === 'bengali' ? book.bengali_title : null;
  const originalLanguage = book.original_language === 'not clear' ? 'English' : book.original_language;
  const displayLanguage = requested && translated ? requested : originalLanguage;
  const covers = (book.covers || []).filter(cover => cover.language === displayLanguage && approvedCoverAsset(cover.asset_url))
    .sort((a, b) => b.is_primary - a.is_primary || a.sort_order - b.sort_order || a.id - b.id);
  return {
    ...book, displayTitle: translated || book.original_title, displayLanguage,
    displayCover: covers[0] || null,
    displayLinks: (book.links || []).filter(link => link.language === displayLanguage).map(link =>
      book.id === 1 && link.url === UNAVAILABLE_READER
        ? { ...link, unavailable: 'Source currently unavailable (HTTP 404); retained in the source ledger.' }
        : link),
    availabilityTag: requested && !translated ? `${requested} not available` : null,
    category: categoryFor(book.person),
  };
}

export function readLibraryState(params) {
  const page = Number(params.get('page'));
  return {
    view: params.get('view') === 'list' ? 'list' : 'cards',
    lang: ['english', 'bengali'].includes(params.get('lang')) ? params.get('lang') : 'original',
    person: CATEGORIES.some(([id]) => id === params.get('person')) ? params.get('person') : 'all',
    q: (params.get('q') || '').slice(0, 200),
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
  };
}

export function libraryStateQuery(state) {
  const params = new URLSearchParams();
  for (const key of ['view', 'lang', 'person', 'q', 'page']) params.set(key, String(state[key]));
  return params.toString();
}

export function filterBooks(books, state) {
  const query = state.q.trim().normalize('NFKC').toLocaleLowerCase();
  return books.filter(book => (state.person === 'all' || categoryFor(book.person) === state.person) &&
    (!query || ['canonical_title', 'original_title', 'english_title', 'bengali_title', 'author', 'person']
      .some(key => (book[key] || '').normalize('NFKC').toLocaleLowerCase().includes(query))));
}
