export const dynamic = 'force-dynamic';

import { getParameterIds } from '@/lib/db';

export async function GET() {
  const DOMAIN = 'https://www.saradakosh.org';
  let viewerPaths = [];
  
  try {
    const ids = getParameterIds();
    viewerPaths = ids.map(id => `${DOMAIN}/reports/viewer/${id}`);
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
