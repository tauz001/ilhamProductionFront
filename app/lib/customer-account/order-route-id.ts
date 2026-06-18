const SHOPIFY_ORDER_GID_PREFIX = 'gid://shopify/Order/';

export function encodeOrderRouteId(orderId: string) {
  return toBase64(orderId)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeOrderRouteId(routeId: string) {
  const normalized = routeId.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized.padEnd(normalized.length + 4 - padding, '=');

  return fromBase64(padded);
}

export function getNumericOrderId(orderId: string) {
  const cleanOrderId = orderId.trim();

  if (/^\d+$/.test(cleanOrderId)) return cleanOrderId;

  if (cleanOrderId.startsWith(SHOPIFY_ORDER_GID_PREFIX)) {
    const numericId = cleanOrderId.slice(SHOPIFY_ORDER_GID_PREFIX.length);
    return /^\d+$/.test(numericId) ? numericId : null;
  }

  return null;
}

export function getOrderGid(orderId: string) {
  const numericId = getNumericOrderId(orderId);
  return numericId ? `${SHOPIFY_ORDER_GID_PREFIX}${numericId}` : orderId;
}

export function getOrderRouteId(orderId: string) {
  return getNumericOrderId(orderId) ?? encodeOrderRouteId(orderId);
}

function toBase64(value: string) {
  if (typeof btoa === 'function') return btoa(value);

  const BufferCtor = (globalThis as any).Buffer;
  if (BufferCtor) return BufferCtor.from(value, 'utf8').toString('base64');

  throw new Error('Base64 encoding is not available in this runtime.');
}

function fromBase64(value: string) {
  if (typeof atob === 'function') return atob(value);

  const BufferCtor = (globalThis as any).Buffer;
  if (BufferCtor) return BufferCtor.from(value, 'base64').toString('utf8');

  throw new Error('Base64 decoding is not available in this runtime.');
}
