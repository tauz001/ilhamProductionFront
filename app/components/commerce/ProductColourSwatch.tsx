type ShopifyOptionSwatch = {
  color?: string | null;
  image?: {
    previewImage?: {
      url?: string | null;
    } | null;
  } | null;
} | null;

export function ProductColourSwatch({
  hex,
  label,
  selected = false,
  swatch,
}: {
  hex?: string | null;
  label: string;
  selected?: boolean;
  swatch?: ShopifyOptionSwatch;
}) {
  const imageUrl = swatch?.image?.previewImage?.url;
  const colour = getValidColour(swatch?.color) ?? getValidColour(hex);
  const background = imageUrl
    ? `url("${imageUrl.replaceAll('"', '%22')}") center / cover no-repeat`
    : colour ??
      'linear-gradient(135deg, rgba(177,127,68,0.5), rgba(251,247,238,0.96))';

  return (
    <span
      className={`h-4 w-4 shrink-0 rounded-full border shadow-[inset_0_0_0_1px_rgba(255,255,255,0.45)] ${
        selected ? 'border-ivory/55' : 'border-ink/15'
      }`}
      style={{background}}
      title={`${label} colour`}
      aria-hidden="true"
    />
  );
}

function getValidColour(value?: string | null) {
  const colour = value?.trim();
  if (!colour) return null;

  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(colour)
    ? colour
    : null;
}
