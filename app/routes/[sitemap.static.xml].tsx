import {SITE_URL} from '~/lib/seo';

const STATIC_PAGES = [
  '/',
  '/collections',
  '/collections/all',
  '/collections/new-arrivals',
  '/collections/best-sellers',
  '/blogs',
  '/gifting',
  '/about',
  '/contact',
  '/terms-and-conditions',
  '/policies',
  '/policies/refund-policy',
  '/policies/shipping-policy',
  '/policies/privacy-policy',
  '/policies/terms-of-service',
];

export async function loader() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PAGES.map(
  (path) => `  <url>
    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>
    <changefreq>${path === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${path === '/' ? '1.0' : '0.7'}</priority>
  </url>`,
).join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return character;
    }
  });
}
