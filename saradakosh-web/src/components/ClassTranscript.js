'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu, X, Minus, Plus, Printer } from 'lucide-react';
import styles from './ClassTranscript.module.css';

// Render plain React text nodes. Source links and HTML are never activated.
function inline(value) {
  const text = value.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  return text.split(/(\*\*[^*]+\*\*|__[^_]+__)/g).map((part, index) => /^(\*\*|__)/.test(part) ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

function parse(markdown) {
  const blocks = [];
  let paragraph = [];
  const flush = () => { if (paragraph.length) { blocks.push({ kind: 'paragraph', text: paragraph.join(' ') }); paragraph = []; } };
  for (const raw of markdown.replace(/\r\n?/g, '\n').split('\n')) {
    const line = raw.trim();
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    const bullet = /^(?:[-*+]\s+|\d+[.)]\s+)(.+)$/.exec(line);
    if (!line) flush();
    else if (heading) { flush(); if (heading[1].length > 1 || blocks.length) blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] }); }
    else if (/^(?:---+|\*\*\*+)$/.test(line)) { flush(); blocks.push({ kind: 'rule' }); }
    else if (bullet) { flush(); const last = blocks.at(-1); if (last?.kind === 'list') last.items.push(bullet[1]); else blocks.push({ kind: 'list', items: [bullet[1]] }); }
    else paragraph.push(line.replace(/^>\s?/, ''));
  }
  flush();
  return blocks;
}

export default function ClassTranscript({ record, markdown }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [size, setSize] = useState(20);
  const blocks = useMemo(() => parse(markdown), [markdown]);
  const headings = blocks.map((block, index) => ({ ...block, index })).filter(block => block.kind === 'heading');
  return <div className={styles.reader} style={{ '--script-size': `${size}px` }}>
    <a className={styles.skip} href="#script">Skip to transcript</a>
    <header className={styles.topbar}><Link href={`/classes/${encodeURIComponent(record.subject)}`}><ArrowLeft size={19} />Classes</Link><span>Saradakosh</span><button className={styles.burger} aria-label={menuOpen ? 'Close contents menu' : 'Open contents menu'} aria-expanded={menuOpen} aria-controls="transcript-contents" onClick={() => setMenuOpen(value => !value)}>{menuOpen ? <X /> : <Menu />}</button></header>
    <div className={styles.layout}>
      <aside id="transcript-contents" className={`${styles.contents} ${menuOpen ? styles.open : ''}`}>
        <nav aria-label="Transcript contents"><h2>Contents</h2><Link href="/classes">All classes</Link><Link href="/schedule">Class schedule</Link>{headings.map(heading => <a key={heading.index} href={`#section-${heading.index}`} onClick={() => setMenuOpen(false)}>{inline(heading.text)}</a>)}</nav>
        <div className={styles.tools}><span>Text size</span><div><button aria-label="Decrease text size" disabled={size <= 18} onClick={() => setSize(value => value - 1)}><Minus size={18} /></button><span aria-live="polite">{size}</span><button aria-label="Increase text size" disabled={size >= 28} onClick={() => setSize(value => value + 1)}><Plus size={18} /></button></div><button onClick={() => window.print()}><Printer size={18} />Print transcript</button></div>
      </aside>
      <main id="script" className={styles.paper}>
        <header><p>{record.subject} · <time dateTime={record.date}>{new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${record.date}T00:00:00Z`))}</time></p><h1>{record.title}</h1></header>
        <article aria-label="Class transcript">{blocks.map((block, index) => {
          if (block.kind === 'heading') { const Heading = `h${Math.max(2, block.level)}`; return <Heading key={index} id={`section-${index}`}>{inline(block.text)}</Heading>; }
          if (block.kind === 'list') return <ul key={index}>{block.items.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>;
          if (block.kind === 'rule') return <hr key={index} />;
          return <p key={index}>{inline(block.text)}</p>;
        })}</article>
      </main>
    </div>
  </div>;
}
