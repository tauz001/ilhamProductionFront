import {BRAND_NAME, LOGO_URL, SITE_URL} from '~/lib/seo';

export async function loader() {
  const manifest = {
    name: 'ilham - Lucknowi Chikankari Atelier',
    short_name: 'ilham',
    description: BRAND_NAME,
    start_url: SITE_URL,
    scope: SITE_URL,
    display: 'standalone',
    background_color: '#faf6ec',
    theme_color: '#faf6ec',
    icons: [
      {
        src: LOGO_URL,
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: LOGO_URL,
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
