type MetafieldLike = {
  key?: string | null;
  namespace?: string | null;
  value?: string | null;
  reference?: unknown;
} | null;

type MetafieldOwner = {
  handle?: string | null;
  metafields?: {
    nodes?: MetafieldLike[];
  } | MetafieldLike[] | null;
};

const loggedMissingFields = new Set<string>();

export function logMissingShopifyField(
  scope: string,
  fieldName: string,
  adminAction: string,
) {
  const key = `${scope}:${fieldName}`;
  if (loggedMissingFields.has(key)) return;
  loggedMissingFields.add(key);
  console.warn(`Missing Shopify field: ${fieldName}. ${adminAction}`);
}

export function getMetafieldValue(
  owner: MetafieldOwner | null | undefined,
  key: string,
  namespace = 'custom',
): string | null {
  const metafields = Array.isArray(owner?.metafields)
    ? owner?.metafields
    : owner?.metafields?.nodes;

  const metafield = metafields?.find(
    (field) => field?.key === key && field.namespace === namespace,
  );

  return metafield?.value ?? null;
}

export function getMetafieldImage(
  owner: MetafieldOwner | null | undefined,
  key: string,
  namespace = 'custom',
):
  | {
      url?: string | null;
      altText?: string | null;
      width?: number | null;
      height?: number | null;
    }
  | null {
  const metafields = Array.isArray(owner?.metafields)
    ? owner?.metafields
    : owner?.metafields?.nodes;

  const metafield = metafields?.find(
    (field) => field?.key === key && field.namespace === namespace,
  );
  const reference = metafield?.reference as
    | {
        image?: {
          url?: string | null;
          altText?: string | null;
          width?: number | null;
          height?: number | null;
        } | null;
      }
    | null
    | undefined;

  return reference?.image ?? null;
}

export function parseListField(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing for single-line text metafields.
  }

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function tagIncludes(tags: string[] | null | undefined, value: string) {
  const normalized = value.toLowerCase();
  return (tags ?? []).some(
    (tag) =>
      tag.toLowerCase() === normalized ||
      tag.toLowerCase() === normalized.replaceAll('-', ' '),
  );
}
