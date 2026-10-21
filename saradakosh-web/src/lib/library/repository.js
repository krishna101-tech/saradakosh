import db from '../db.js';

export function getLibraryBooks() {
  const books = db.prepare('SELECT * FROM library_books ORDER BY sort_order, id').all();
  const links = db.prepare('SELECT * FROM library_book_links ORDER BY book_id, sort_order, id').all();
  // Full rights/source evidence stays in the DB/import ledger, outside client payloads.
  const covers = db.prepare(`SELECT id, book_id, language, asset_url, is_primary, sort_order,
    edition, volume, representation, variants_json FROM library_book_covers ORDER BY book_id, sort_order, id`).all();
  return books.map(book => ({
    ...book, links: links.filter(link => link.book_id === book.id), covers: covers.filter(cover => cover.book_id === book.id),
  }));
}
