'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen, Grid2X2, List, Search } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import { BookCard, BookDetailDialog, BookListRow } from './BookPresentation';
import { CATEGORIES, PAGE_SIZE, filterBooks, libraryStateQuery, readLibraryState, resolveBookDisplay } from '@/lib/library/model.mjs';
import './library.css';

export default function LibraryClient({ books }) {
  const params = useSearchParams();
  const state = readLibraryState(params);
  const [selectedId, setSelectedId] = useState(null);
  const matches = filterBooks(books, state);
  const totalPages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(state.page, totalPages);
  const displayed = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(book => resolveBookDisplay(book, state.lang));
  const selected = selectedId ? resolveBookDisplay(books.find(book => book.id === selectedId), state.lang) : null;
  const change = patch => {
    window.history.pushState(null, '', `?${libraryStateQuery({
      ...state, page: ('q' in patch || 'person' in patch) ? 1 : page, ...patch,
    })}`);
    if ('page' in patch) document.getElementById('library-results')?.scrollIntoView({ block: 'start' });
  };
  const Renderer = state.view === 'cards' ? BookCard : BookListRow;

  return (
    <main className="library">
      <header className="library-header">
        <Link href="/" className="library-brand"><BookOpen size={24} aria-hidden="true" />SaradaKosh <span> / Library</span></Link>
        <ThemeSelector />
      </header>
      <div className="library-intro">
        <p className="library-eyebrow">THE RAMAKRISHNA–VEDANTA COLLECTION</p>
        <div className="library-heading-line"><h1>A lifetime of reading.</h1><span className="collection-total">{books.length}<span>canonical books</span></span></div>
        <p className="library-lede">Lives, conversations, and teachings from the Ramakrishna–Vedanta tradition. A collection to return to.</p>
      </div>

      <section className="library-toolbar" aria-label="Library controls">
        <form className="library-search" onSubmit={event => {
          event.preventDefault();
          change({ q: new FormData(event.currentTarget).get('q').toString().trim() });
        }}>
          <label htmlFor="library-search">Search the collection</label>
          <div><Search size={19} aria-hidden="true" /><input key={state.q} defaultValue={state.q} id="library-search" name="q" type="search" maxLength={200} placeholder="Title, author, or person" /><button type="submit">Search</button></div>
        </form>
        <div className="library-toggles">
          <div className="segmented-control" role="group" aria-label="Book language">
            {[['original', 'Original'], ['english', 'English'], ['bengali', 'বাংলা']].map(([id, label]) => <button key={id} lang={id === 'bengali' ? 'bn' : 'en'} aria-pressed={state.lang === id} onClick={() => change({ lang: id })}>{label}</button>)}
          </div>
          <div className="segmented-control" role="group" aria-label="Library view">
            <button aria-pressed={state.view === 'cards'} onClick={() => change({ view: 'cards' })}><Grid2X2 size={17} aria-hidden="true" />Cards</button>
            <button aria-pressed={state.view === 'list'} onClick={() => change({ view: 'list' })}><List size={19} aria-hidden="true" />List</button>
          </div>
        </div>
        <div className="category-controls" role="group" aria-label="Book category">
          {CATEGORIES.map(([id, label]) => <button key={id} aria-pressed={state.person === id} onClick={() => change({ person: id })}>{label}</button>)}
        </div>
      </section>

      <div id="library-results" className="library-results-line">
        <p role="status">{matches.length ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, matches.length)} of ${matches.length} books` : '0 books'}{state.q ? ` for “${state.q}”` : ''}</p>
        <span>{state.lang === 'original' ? 'Original editions' : state.lang === 'english' ? 'English titles, where available' : 'Bengali titles, where available'}</span>
      </div>
      {displayed.length ? <ul className={state.view === 'cards' ? 'library-grid' : 'library-list'} aria-label="Books">
        {displayed.map(book => <Renderer key={book.id} book={book} onOpen={setSelectedId} />)}
      </ul> : <section className="library-empty"><BookOpen size={36} aria-hidden="true" /><h2>No books found</h2><p>Try another title or author, or return to the complete collection.</p><button onClick={() => change({ q: '', person: 'all' })}>Clear search and filters</button></section>}
      <nav className="library-pagination" aria-label="Catalogue pages">
        <button disabled={page <= 1} onClick={() => change({ page: page - 1 })}><ArrowLeft size={17} aria-hidden="true" />Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => change({ page: page + 1 })}>Next<ArrowRight size={17} aria-hidden="true" /></button>
      </nav>
      <footer className="library-footer"><BookOpen size={18} aria-hidden="true" /><span>One collection. Many languages. A shared inheritance.</span></footer>
      {selected && <BookDetailDialog key={selected.id} book={selected} onClose={() => setSelectedId(null)} />}
    </main>
  );
}
