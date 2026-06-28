import Database from 'better-sqlite3';
import path from 'path';

export async function GET() {
  const DOMAIN = 'https://www.saradakosh.org';
  let viewerPaths = [];
  
  try {
    const dbPath = path.resolve(process.cwd(), 'saradakosh.db');
    const db = new Database(dbPath, { readonly: true });
    const stmt = db.prepare('SELECT id FROM parameters');
    const rows = stmt.all();
    viewerPaths = rows.map(r => `${DOMAIN}/reports/viewer/${r.id}`);
    db.close();
  } catch (error) {
    console.error("Error generating reports sitemap paths:", error);
  }

  const urlElements = viewerPaths.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=600',
    },
  });
}
