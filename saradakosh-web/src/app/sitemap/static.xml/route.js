export const dynamic = 'force-dynamic';

export async function GET() {
  const DOMAIN = 'https://www.saradakosh.org';
  const staticPaths = [
    { url: `${DOMAIN}`, changefreq: 'daily', priority: 1.0 },
    { url: `${DOMAIN}/quotes`, changefreq: 'weekly', priority: 0.8 },
    { url: `${DOMAIN}/about`, changefreq: 'monthly', priority: 0.8 },
    { url: `${DOMAIN}/reports/vivekananda`, changefreq: 'monthly', priority: 0.8 },
    { url: `${DOMAIN}/reports/refs`, changefreq: 'monthly', priority: 0.6 },
    { url: `${DOMAIN}/reports/mega-period`, changefreq: 'monthly', priority: 0.6 },
  ];

  const urlElements = staticPaths.map(p => `  <url>
    <loc>${p.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
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
