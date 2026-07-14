type SelectedOption = {
  name?: string | null;
  value?: string | null;
};

type ProductMediaImage = {
  id?: string | null;
  url?: string | null;
  altText?: string | null;
};

const VIEW_PRIORITY = new Map([
  ['front', 0],
  ['full look', 1],
  ['side', 2],
  ['back', 3],
  ['detail', 4],
]);

export function getVariantColour(variant: any) {
  const colourOption = variant?.selectedOptions?.find(
    (option: SelectedOption) => isColourOptionName(option.name),
  );

  return colourOption?.value?.trim() ?? '';
}

export function getColourMediaImages(
  images: ProductMediaImage[],
  colour?: string | null,
) {
  const normalizedColour = normalizeLabelPart(colour);
  if (!normalizedColour) return [];

  return images
    .map((image, index) => ({
      image,
      index,
      label: parseColourMediaLabel(image.altText),
    }))
    .filter(({image, label}) => {
      return Boolean(
        image?.url &&
        label &&
        normalizeLabelPart(label.colour) === normalizedColour,
      );
    })
    .sort((left, right) => {
      const leftPriority = getViewPriority(left.label?.view);
      const rightPriority = getViewPriority(right.label?.view);
      return leftPriority - rightPriority || left.index - right.index;
    })
    .map(({image}) => image);
}

export function getColourListingImages(
  productImages: ProductMediaImage[],
  colour: string,
  variantImage?: ProductMediaImage | null,
) {
  const colourImages = getColourMediaImages(productImages, colour);
  const candidates = colourImages.length
    ? colourImages
    : variantImage
      ? [variantImage]
      : [];

  return getUniqueMediaImages(candidates);
}

function parseColourMediaLabel(altText?: string | null) {
  if (!altText?.includes('|')) return null;

  const [colour, ...viewParts] = altText.split('|');
  const normalizedColour = colour?.trim();
  const view = viewParts.join('|').trim();

  if (!normalizedColour || !view) return null;
  return {colour: normalizedColour, view};
}

function getViewPriority(view?: string | null) {
  return VIEW_PRIORITY.get(normalizeLabelPart(view)) ?? VIEW_PRIORITY.size;
}

function normalizeLabelPart(value?: string | null) {
  return value?.trim().replace(/\s+/g, ' ').toLowerCase() ?? '';
}

function isColourOptionName(name?: string | null) {
  const normalized = normalizeLabelPart(name);
  return normalized === 'color' || normalized === 'colour';
}

function getUniqueMediaImages(images: ProductMediaImage[]) {
  const seen = new Set<string>();

  return images.filter((image) => {
    if (!image?.url) return false;
    const key = image.id ?? image.url.split('?')[0];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
