'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import { coverDelivery } from '@/lib/library/covers.mjs';

export function BookCover({ book, detail = false }) {
  const asset = book.displayCover?.asset_url;
  const delivery = coverDelivery(book.displayCover, detail);
  const [failed, setFailed] = useState(null);
  return (
    <span className={`book-cover cover-${book.category}`} data-cover-language={book.displayLanguage} aria-hidden="true">
      {delivery && asset && failed !== asset ? (
        <picture>
          {delivery?.sources.map(source => <source key={source.type} type={source.type} srcSet={source.srcSet} sizes={delivery.sizes} />)}
          {/* Native pre-optimized CDN variants avoid application-server resizing. */}
          <img src={delivery.src} srcSet={delivery.sources.find(source => source.type === 'image/webp')?.srcSet}
            sizes={delivery.sizes} width={delivery.width} height={delivery.height}
            loading={detail ? 'eager' : 'lazy'} decoding="async" fetchPriority="low" alt=""
            ref={element => {
              // An SSR image may fail before hydration attaches onError.
              if (element?.complete && element.naturalWidth === 0) setFailed(asset);
            }}
            onError={() => setFailed(asset)} />
          {book.displayCover.representation === 'series-volume' && <span className="cover-volume">{book.displayCover.volume}</span>}
        </picture>
      ) : (
        <span className="cover-design">
          <span className="cover-imprint">SARADAKOSH<br />LIBRARY</span>
          <span className="cover-rule" />
          <span className="cover-title" lang={{ Bengali: 'bn', Hindi: 'hi', French: 'fr', English: 'en' }[book.displayLanguage]}>{book.displayTitle}</span>
          {book.author && <span className="cover-author">{book.author}</span>}
          <span className="cover-footer">{book.displayLanguage} · Collected literature</span>
        </span>
      )}
    </span>
  );
}

export function BookLinks({ book }) {
  return (
    <div className="book-links" aria-label={`Full text in ${book.displayLanguage}`}>
      {book.displayLinks.length ? book.displayLinks.map(link => (
        <span key={link.id} className="book-link-entry">
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="book-link">
            {link.label}<ExternalLink size={14} aria-hidden="true" />
          </a>
          {link.annotation && <span className="book-link-note">{link.annotation}</span>}
        </span>
      )) : <span className="book-no-links">Full text not listed</span>}
    </div>
  );
}

function BookLanguage({ book, id }) {
  return <span id={id} className="book-language">
    {book.displayLanguage}{book.availabilityTag ? ` · ${book.availabilityTag}` : ''}
    {book.original_language === 'not clear' && <span className="book-language-note">Original language not clear; displayed in {book.displayLanguage}.</span>}
  </span>;
}

function BookMetadata({ book, idPrefix }) {
  return (
    <span className="book-metadata">
      <span className="book-title" lang={{ Bengali: 'bn', Hindi: 'hi', French: 'fr', English: 'en' }[book.displayLanguage]}>{book.displayTitle}</span>
      {book.author && <span id={`${idPrefix}-author`} className="book-author">{book.author}</span>}
      <BookLanguage book={book} id={`${idPrefix}-language`} />
    </span>
  );
}

export function BookCard({ book, onOpen }) {
  const id = useId();
  const description = [book.author && `${id}-author`, `${id}-language`].filter(Boolean).join(' ');
  return (
    <li className="book-card" data-book-id={book.id}>
      <button className="book-open" onClick={() => onOpen(book.id)} aria-label={`Details: ${book.displayTitle}`} aria-describedby={description}>
        <BookCover book={book} /><BookMetadata book={book} idPrefix={id} />
      </button>
      <BookLinks book={book} />
    </li>
  );
}

export function BookListRow({ book, onOpen }) {
  const id = useId();
  const description = [book.author && `${id}-author`, `${id}-language`].filter(Boolean).join(' ');
  return (
    <li className="book-list-row" data-book-id={book.id}>
      <button className="book-open" onClick={() => onOpen(book.id)} aria-label={`Details: ${book.displayTitle}`} aria-describedby={description}>
        <span className="book-number">{String(book.sort_order + 1).padStart(3, '0')}</span><BookMetadata book={book} idPrefix={id} />
      </button>
      <BookLinks book={book} />
    </li>
  );
}

export function BookDetailDialog({ book, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  const close = () => dialog.current.close();
  return (
    <dialog ref={dialog} className="book-dialog" aria-labelledby="book-dialog-title" onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) close(); }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      }}>
      <button className="dialog-close" aria-label="Close book details" onClick={close} autoFocus><X size={22} /></button>
      <div className="dialog-layout">
        <BookCover book={book} detail />
        <div className="dialog-copy">
          <h2 id="book-dialog-title" lang={{ Bengali: 'bn', Hindi: 'hi', French: 'fr', English: 'en' }[book.displayLanguage]}>{book.displayTitle}</h2>
          {book.author && <p className="dialog-author">{book.author}</p>}
          <BookLanguage book={book} />
          <section className="dialog-summary" aria-label="English summary">
            <h3>About this book</h3>
            <p lang="en">{book.summary || 'A summary is not yet available for this book.'}</p>
          </section>
          <h3>Read the full text</h3>
          <BookLinks book={book} />
        </div>
      </div>
    </dialog>
  );
}
