import {BRAND_NAME} from '~/lib/seo';

export async function loader() {
  const manifest = {
    name: 'ilham - Lucknowi Chikankari Atelier',
    short_name: 'ilham',
    description: BRAND_NAME,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#faf6ec',
    theme_color: '#faf6ec',
    icons: [
      {
        src: '/ilham-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/ilham-icon-512.png',
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
