export async function GET() {
  const DOMAIN = 'https://www.saradakosh.org';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${DOMAIN}/sitemap/static.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap/quotes.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${DOMAIN}/sitemap/reports.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=600',
    },
  });
}
