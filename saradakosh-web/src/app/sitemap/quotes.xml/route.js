export const dynamic = 'force-dynamic';

import quotesData from '@/data/quotes.json';

export async function GET() {
  const DOMAIN = 'https://www.saradakosh.org';
  
  const urlElements = quotesData.map(q => {
    const quoteId = encodeURIComponent(q.id);
    return `  <url>
    <loc>${DOMAIN}/quotes/post/${quoteId}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n');

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
