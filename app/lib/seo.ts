export const SITE_URL = 'https://ilhamchikankari.com';
export const BRAND_NAME = 'ilham chikankari';
export const LOGO_URL =
  'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/ilham_logo.png?v=1780686255';

const SOCIAL_LINKS = [
  'https://www.instagram.com/ilhamchikankari/',
  'https://www.facebook.com/profile.php?id=61590279832779',
  'https://in.pinterest.com/ilhamChikankari/',
  'https://www.reddit.com/user/Alone_Try3341/',
];

const CORE_NAVIGATION_LINKS = [
  {name: 'Home', path: '/'},
  {name: 'Women', path: '/collections/women'},
  {name: 'Men', path: '/collections/men'},
  {name: 'Wedding', path: '/collections/wedding'},
  {name: 'Gifting', path: '/gifting'},
  {name: 'Heritage', path: '/about'},
  {name: 'Contact', path: '/contact'},
  {name: 'Terms and Conditions', path: '/terms-and-conditions'},
];

export function canonicalUrl(pathname = '/') {
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath}`;
}

export function productJsonLd(product: any, selectedVariant: any) {
  const price = selectedVariant?.price ?? product?.priceRange?.minVariantPrice;
  const images = [
    product?.featuredImage?.url,
    ...(product?.images?.nodes ?? []).map((image: any) => image?.url),
  ].filter(Boolean);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product?.title,
    image: [...new Set(images)],
    description: product?.seo?.description ?? product?.description,
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
    },
    sku: selectedVariant?.sku,
    category: product?.productType,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product?.handle}`,
      priceCurrency: price?.currencyCode ?? 'INR',
      price: price?.amount,
      availability: selectedVariant?.availableForSale
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
      },
    },
  };
}

export function collectionItemListJsonLd(collection: any, products: any[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: collection?.title,
    description: collection?.description,
    url: `${SITE_URL}/collections/${collection?.handle}`,
    itemListElement: products.slice(0, 24).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/products/${product.handle}`,
      name: product.title,
    })),
  };
}

export function breadcrumbJsonLd(items: {name: string; url: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    alternateName: ['ilham', 'Ilham Chikankari', 'Lucknowi Chikankari Atelier'],
    description:
      'A Lucknowi chikankari atelier for hand-embroidered Indian clothing, gifting, and wedding pieces.',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
    },
    sameAs: SOCIAL_LINKS,
    foundingLocation: {
      '@type': 'Place',
      name: 'Lucknow, Uttar Pradesh, India',
    },
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'ilham',
    alternateName: BRAND_NAME,
    url: SITE_URL,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function siteNavigationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/#site-navigation`,
    name: 'Primary storefront navigation',
    itemListElement: CORE_NAVIGATION_LINKS.map((item, index) => ({
      '@type': 'SiteNavigationElement',
      position: index + 1,
      name: item.name,
      url: canonicalUrl(item.path),
    })),
  };
}

export function siteJsonLdGraph() {
  const withoutContext = (node: Record<string, unknown>) => {
    const {'@context': _context, ...rest} = node;
    return rest;
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      withoutContext(organizationJsonLd()),
      withoutContext(websiteJsonLd()),
      withoutContext(siteNavigationJsonLd()),
    ],
  };
}
