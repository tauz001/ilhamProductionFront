import type {Storefront} from '@shopify/hydrogen';
import type {
  HomepageCampaignProductFragment,
  HomepageCampaignSettingsQuery,
} from 'storefrontapi.generated';
import {compareProductsByAvailability} from './product-availability';

export type HomepageCampaignImage = {
  altText?: string | null;
  height?: number | null;
  id?: string | null;
  url: string;
  width?: number | null;
};

export type HomepageCampaign = {
  banner: {
    ctaLabel: string;
    ctaUrl: string;
    desktopImage: HomepageCampaignImage;
    eyebrow: string;
    mobileImage: HomepageCampaignImage;
    subtitle: string;
    textTheme: 'dark' | 'light';
    title: string;
  } | null;
  handle: HomepageCampaignHandle;
  products: HomepageCampaignProductFragment[];
  rail: {
    linkLabel: string;
    linkUrl: string;
    subtitle: string;
    title: string;
  } | null;
};

type HomepageCampaignHandle = 'slot-1' | 'slot-2';

type CampaignConfig = Omit<HomepageCampaign, 'products'> & {
  productLimit: number;
  productQuery: string;
  productSort: ProductSort;
};

type ProductSort = {
  reverse: boolean;
  sortKey: 'BEST_SELLING' | 'CREATED_AT' | 'PRICE' | 'TITLE';
};

type MetaobjectField = {
  key?: string | null;
  reference?: {
    image?: HomepageCampaignImage | null;
  } | null;
  type?: string | null;
  value?: string | null;
};

type MetaobjectNode = {
  fields?: MetaobjectField[] | null;
  handle?: string | null;
  id?: string | null;
} | null;

const CAMPAIGN_HANDLES = ['slot-1', 'slot-2'] as const;
const TRUE_VALUES = new Set(['1', 'on', 'true', 'yes']);
const MAX_PRODUCTS = 12;
const DEFAULT_PRODUCTS = 8;

export async function loadHomepageCampaigns(
  storefront: Storefront,
  now = new Date(),
): Promise<HomepageCampaign[]> {
  let response: HomepageCampaignSettingsQuery;

  try {
    response = await storefront.query(HOMEPAGE_CAMPAIGNS_QUERY, {
      cache: storefront.CacheShort(),
    });
  } catch {
    return [];
  }

  const nodes = [response.slotOne, response.slotTwo];
  const configs = nodes
    .map((node, index) =>
      normalizeCampaign(CAMPAIGN_HANDLES[index], node, now),
    )
    .filter((campaign): campaign is CampaignConfig => Boolean(campaign));

  const campaigns = await Promise.all(
    configs.map(async (campaign) => {
      if (!campaign.productQuery || !campaign.rail) {
        return {...campaign, products: []};
      }

      try {
        const productResponse = await storefront.query(
          HOMEPAGE_CAMPAIGN_PRODUCTS_QUERY,
          {
            cache: storefront.CacheShort(),
            variables: {
              first: campaign.productLimit,
              query: campaign.productQuery,
              reverse: campaign.productSort.reverse,
              sortKey: campaign.productSort.sortKey,
            },
          },
        );

        return {
          ...campaign,
          products: [...(productResponse.products?.nodes ?? [])].sort(
            compareProductsByAvailability,
          ),
        };
      } catch {
        return {...campaign, products: []};
      }
    }),
  );

  return campaigns
    .map(({productLimit, productQuery, productSort, ...campaign}) => campaign)
    .filter((campaign) => Boolean(campaign.banner || campaign.products.length));
}

function normalizeCampaign(
  handle: HomepageCampaignHandle,
  node: MetaobjectNode | undefined,
  now: Date,
): CampaignConfig | null {
  if (!node?.fields?.length) return null;

  const fields = new Map(
    node.fields
      .filter((field) => Boolean(field?.key))
      .map((field) => [field.key as string, field]),
  );

  if (!readBoolean(fields, ['enabled'])) return null;
  if (!isWithinSchedule(fields, now)) return null;

  const bannerEnabled = readBoolean(fields, ['show_banner', 'banner_enabled']);
  const railEnabled = readBoolean(fields, ['show_rail', 'rail_enabled']);
  const desktopImage = readImage(fields, [
    'desktop_image',
    'banner_image',
    'image',
  ]);
  const mobileImage =
    readImage(fields, ['mobile_image', 'banner_mobile_image']) ?? desktopImage;
  const title = readText(fields, ['banner_title', 'title']);
  const subtitle = readText(fields, ['banner_subtitle', 'subtitle']);
  const eyebrow = readText(fields, ['banner_eyebrow', 'eyebrow']);
  const ctaUrl = readUrl(fields, ['banner_link', 'cta_url', 'link']);
  const ctaLabel = readText(fields, ['banner_link_label', 'cta_label']);
  const textTheme: 'dark' | 'light' =
    readText(fields, ['text_theme']).toLowerCase() === 'dark'
      ? 'dark'
      : 'light';

  const banner =
    bannerEnabled && desktopImage && mobileImage
      ? {
          ctaLabel,
          ctaUrl,
          desktopImage: withFallbackAlt(
            desktopImage,
            readText(fields, ['image_alt']) || title || 'ilham campaign',
          ),
          eyebrow,
          mobileImage: withFallbackAlt(
            mobileImage,
            readText(fields, ['image_alt']) || title || 'ilham campaign',
          ),
          subtitle,
          textTheme,
          title,
        }
      : null;

  const productTag = readText(fields, ['product_tag', 'rail_tag']).slice(0, 100);
  const railTitle =
    readText(fields, ['rail_title']) || formatTagLabel(productTag);
  const rail =
    railEnabled && productTag
      ? {
          linkLabel:
            readText(fields, ['rail_link_label']) || 'View all',
          linkUrl: readUrl(fields, ['rail_link', 'rail_url']),
          subtitle: readText(fields, ['rail_subtitle']),
          title: railTitle,
        }
      : null;

  if (!banner && !rail) return null;

  return {
    banner,
    handle,
    productLimit: clampProductLimit(
      readText(fields, ['product_limit', 'rail_limit']),
    ),
    productQuery: rail ? buildTagQuery(productTag) : '',
    productSort: readProductSort(fields),
    rail,
  };
}

function isWithinSchedule(fields: Map<string, MetaobjectField>, now: Date) {
  const startText = readText(fields, ['start_at', 'starts_at']);
  const endText = readText(fields, ['end_at', 'ends_at']);
  const startAt = parseOptionalDate(startText);
  const endAt = parseOptionalDate(endText);

  if ((startText && !startAt) || (endText && !endAt)) return false;
  if (startAt && endAt && startAt >= endAt) return false;
  if (startAt && now < startAt) return false;
  if (endAt && now >= endAt) return false;

  return true;
}

function readBoolean(
  fields: Map<string, MetaobjectField>,
  keys: string[],
) {
  const value = readText(fields, keys).toLowerCase();
  return TRUE_VALUES.has(value);
}

function readImage(
  fields: Map<string, MetaobjectField>,
  keys: string[],
) {
  for (const key of keys) {
    const image = fields.get(key)?.reference?.image;
    if (image?.url) return image;
  }

  return null;
}

function readText(fields: Map<string, MetaobjectField>, keys: string[]) {
  for (const key of keys) {
    const value = fields.get(key)?.value?.trim();
    if (value) return value;
  }

  return '';
}

function readUrl(fields: Map<string, MetaobjectField>, keys: string[]) {
  const value = readText(fields, keys);
  if (!value || value.length > 2048) return '';

  if (value.startsWith('/') && !value.startsWith('//')) return value;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function readProductSort(fields: Map<string, MetaobjectField>): ProductSort {
  switch (readText(fields, ['product_sort', 'rail_sort']).toLowerCase()) {
    case 'best-selling':
    case 'best_selling':
    case 'bestselling':
      return {sortKey: 'BEST_SELLING', reverse: false};
    case 'price-high':
    case 'price_high':
      return {sortKey: 'PRICE', reverse: true};
    case 'price-low':
    case 'price_low':
      return {sortKey: 'PRICE', reverse: false};
    case 'title':
      return {sortKey: 'TITLE', reverse: false};
    default:
      return {sortKey: 'CREATED_AT', reverse: true};
  }
}

function clampProductLimit(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_PRODUCTS;
  return Math.min(MAX_PRODUCTS, Math.max(2, parsed));
}

function parseOptionalDate(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildTagQuery(tag: string) {
  return `tag:${JSON.stringify(tag)}`;
}

function formatTagLabel(tag: string) {
  if (!tag) return 'Seasonal edit';
  return tag
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function withFallbackAlt(image: HomepageCampaignImage, fallback: string) {
  return {
    ...image,
    altText: image.altText?.trim() || fallback,
  };
}

const HOMEPAGE_CAMPAIGNS_QUERY = `#graphql
  query HomepageCampaignSettings {
    slotOne: metaobject(handle: {type: "homepage_campaign", handle: "slot-1"}) {
      id
      handle
      fields {
        key
        type
        value
        reference {
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
    slotTwo: metaobject(handle: {type: "homepage_campaign", handle: "slot-2"}) {
      id
      handle
      fields {
        key
        type
        value
        reference {
          ... on MediaImage {
            image {
              id
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
` as const;

const HOMEPAGE_CAMPAIGN_PRODUCT_FRAGMENT = `#graphql
  fragment HomepageCampaignProduct on Product {
    id
    title
    handle
    vendor
    productType
    tags
    availableForSale
    featuredImage {
      id
      url
      altText
      width
      height
    }
    images(first: 4) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          id
          title
          availableForSale
          image {
            id
            url
            altText
            width
            height
          }
          selectedOptions {
            name
            value
          }
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
        }
      }
    }
    variantsCount {
      count
    }
    variants(first: 10) {
      nodes {
        id
        title
        availableForSale
        image {
          id
          url
          altText
          width
          height
        }
        product {
          id
          handle
          title
          vendor
          productType
        }
        selectedOptions {
          name
          value
        }
        price {
          amount
          currencyCode
        }
        compareAtPrice {
          amount
          currencyCode
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    metafields(identifiers: [
      {namespace: "custom", key: "subtitle"},
      {namespace: "custom", key: "split_colour_listings"},
      {namespace: "custom", key: "base_title"},
      {namespace: "custom", key: "connected_colour_products"},
      {namespace: "custom", key: "connected_color_products"}
    ]) {
      key
      namespace
      value
    }
  }
` as const;

const HOMEPAGE_CAMPAIGN_PRODUCTS_QUERY = `#graphql
  query HomepageCampaignProducts(
    $first: Int!
    $query: String!
    $reverse: Boolean!
    $sortKey: ProductSortKeys!
  ) {
    products(
      first: $first
      query: $query
      reverse: $reverse
      sortKey: $sortKey
    ) {
      nodes {
        ...HomepageCampaignProduct
      }
    }
  }
  ${HOMEPAGE_CAMPAIGN_PRODUCT_FRAGMENT}
` as const;
