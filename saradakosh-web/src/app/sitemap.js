import Database from 'better-sqlite3';
import path from 'path';
import quotesData from '@/data/quotes.json';

export default function sitemap() {
  const staticPaths = [
    {
      url: 'https://saradakosh.org',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://saradakosh.org/quotes',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://saradakosh.org/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://saradakosh.org/reports/vivekananda',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://saradakosh.org/reports/refs',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://saradakosh.org/reports/mega-period',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Dynamic Quote Posts
  const quotePaths = quotesData.map(q => ({
    url: `https://saradakosh.org/quotes/post/${encodeURIComponent(q.id)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Dynamic Viewer Records
  let viewerPaths = [];
  try {
    const dbPath = path.resolve(process.cwd(), 'saradakosh.db');
    const db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare('SELECT id FROM parameters');
    const rows = stmt.all();
    viewerPaths = rows.map(r => ({
      url: `https://saradakosh.org/reports/viewer/${r.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    }));
    db.close();
  } catch (error) {
    console.error("Error generating dynamic sitemap paths:", error);
  }

  return [...staticPaths, ...quotePaths, ...viewerPaths];
}
