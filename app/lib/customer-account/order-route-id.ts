export function encodeOrderRouteId(orderId: string) {
  return btoa(orderId)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function decodeOrderRouteId(routeId: string) {
  const normalized = routeId.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized.padEnd(normalized.length + 4 - padding, '=');

  return atob(padded);
}
