const SITE_URL = 'https://ilhamchikankari.com';

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
      name: 'ilham chikankari',
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
    name: 'ilham chikankari',
    url: SITE_URL,
    logo: 'https://cdn.shopify.com/s/files/1/0820/4389/6063/files/ilham_logo.png?v=1780686255',
    sameAs: [
      'https://www.instagram.com/ilhamchikankari/',
      'https://www.facebook.com/profile.php?id=61590279832779',
      'https://in.pinterest.com/ilhamChikankari/',
      'https://www.reddit.com/user/Alone_Try3341/',
    ],
  };
}
