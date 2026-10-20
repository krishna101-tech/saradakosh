'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, BookOpen, Search, Play, FileText } from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import styles from './ClassesLibrary.module.css';

const dateLabel = date => new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));

export default function ClassesLibrary({ records, subject }) {
  const [query, setQuery] = useState('');
  const [chapter, setChapter] = useState('');
  const term = query.trim().toLocaleLowerCase();
  const chapters = [...new Set(records.map(record => record.chapter))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const matching = records.filter(record => (!chapter || record.chapter === chapter) && (!term || [record.subject, record.chapter, record.title, record.date, ...record.topics].join(' ').toLocaleLowerCase().includes(term)));
  const subjects = [...new Set(matching.map(record => record.subject))].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));
  const seen = new Set();
  const classes = matching.filter(record => {
    const key = record.videoId || record.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const groups = [...new Set(classes.map(record => record.chapter))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Breadcrumb">
      <Link href={subject ? '/classes' : '/'}><ArrowLeft size={17} />{subject ? 'All subjects' : 'Saradakosh'}</Link>
      <div className={styles.theme}><ThemeSelector /></div>
    </nav>
    <header className={styles.header}>
      <span className={styles.eyebrow}>MORNING CLASS</span>
      <h1>{subject || 'Classes'}</h1>
      <p>{subject ? 'Explore the lectures and recorded topics in each chapter.' : 'Subject Library · Explore the lives and teachings of Sri Ramakrishna, Ma Sarada, and Swami Vivekananda.'}</p>
      <span className={styles.meta}>{subject ? `${classes.length} classes` : `${records.length} classes · ${new Set(records.map(record => record.subject)).size} subjects`}</span>
    </header>
    <div className={styles.filters}>
      <label className={styles.search}><Search size={18} aria-hidden="true" /><span className={styles.srOnly}>Search classes</span><input type="search" placeholder="Search subjects, chapters, or topics…" value={query} onChange={event => setQuery(event.target.value)} /></label>
      {subject && <label><span className={styles.srOnly}>Chapter</span><select value={chapter} onChange={event => setChapter(event.target.value)}><option value="">All chapters</option>{chapters.map(value => <option key={value}>{value}</option>)}</select></label>}
    </div>
    {!subject ? <section className={styles.grid} aria-label="Subject Library">
      {subjects.map(name => {
        const rows = records.filter(record => record.subject === name);
        return <Link key={name} href={`/classes/${encodeURIComponent(name)}`} className={styles.card}>
          <BookOpen size={25} aria-hidden="true" /><h2>{name}</h2>
          <div className={styles.cardFooter}><span><strong>{rows.length}</strong> classes · {new Set(rows.map(record => record.chapter)).size} chapters</span><ArrowUpRight size={20} aria-hidden="true" /></div>
        </Link>;
      })}
    </section> : <section className={styles.chapters} aria-label="Chapters">
      {groups.map(name => <details key={name} className={styles.chapter} open={!!term || !!chapter || undefined}>
        <summary><h2>{name}</h2><span>{classes.filter(record => record.chapter === name).length} classes</span></summary>
        {classes.filter(record => record.chapter === name).map(record => <article key={record.videoId || record.id} className={styles.video}>
          {record.videoId && <div className={styles.media}>
            {/* Public YouTube thumbnail; no video or image files are copied. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img loading="lazy" width="320" height="180" src={`https://i.ytimg.com/vi/${record.videoId}/hqdefault.jpg`} alt="" />
            <div className={styles.actions}>
              <a className={styles.watch} href={`https://www.youtube.com/watch?v=${record.videoId}`} target="_blank" rel="noopener noreferrer"><Play size={16} />Open video<span className={styles.srOnly}>: {record.title} (opens in a new tab)</span></a>
              {record.transcriptAvailable ? <Link prefetch={false} className={styles.read} href={`/classes/transcripts/${record.videoId}`} target="_blank" rel="noopener noreferrer"><FileText size={16} />Read transcript<span className={styles.srOnly}>: {record.title} (opens in a new tab)</span></Link> : <button type="button" className={styles.unavailable} disabled title="Transcript unavailable" aria-label="Read transcript: unavailable for this class"><FileText size={16} />Read transcript</button>}
            </div>
          </div>}
          <div className={styles.content}>
            <time dateTime={record.date}>{dateLabel(record.date)}</time><h3>{record.title}</h3>
            {record.summary && <p className={styles.summary}>{record.summary}</p>}
            {!!record.topics.length && <ul>{record.topics.map((topic, index) => <li key={index}>{topic}</li>)}</ul>}
          </div>
        </article>)}
      </details>)}
    </section>}
    {!matching.length && <p role="status" className={styles.empty}>No classes match your search.</p>}
    <footer className={styles.footer}><Link href="/">Saradakosh</Link><Link href="/classes">Classes</Link><Link href="/schedule">Class schedule</Link></footer>
  </main>;
}
