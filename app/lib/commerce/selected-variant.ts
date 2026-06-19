import {isVariantPurchasable} from './variant-availability';

export function buildVariantOptionGroups(
  variants: any[],
  selectedVariant: any,
) {
  const optionNames: string[] = [];
  const valuesByName = new Map<string, Set<string>>();

  variants.forEach((variant) => {
    variant.selectedOptions?.forEach((option: {name: string; value: string}) => {
      if (isDefaultTitleOption(option)) return;

      if (!valuesByName.has(option.name)) {
        valuesByName.set(option.name, new Set<string>());
        optionNames.push(option.name);
      }
      valuesByName.get(option.name)?.add(option.value);
    });
  });

  return optionNames.map((name) => ({
    name,
    values: [...(valuesByName.get(name) ?? [])].map((value) => {
      const variantIndex = findVariantIndexForOption(
        variants,
        selectedVariant,
        name,
        value,
      );
      const variant = variants[variantIndex];

      return {
        value,
        selected: getOptionValue(selectedVariant, name) === value,
        available: isVariantPurchasable(variant),
        variantIndex,
      };
    }),
  }));
}

export function getOptionValue(variant: any, optionName: string) {
  return (
    variant?.selectedOptions?.find(
      (option: {name: string}) => option.name === optionName,
    )?.value ?? ''
  );
}

function findVariantIndexForOption(
  variants: any[],
  selectedVariant: any,
  optionName: string,
  optionValue: string,
) {
  const selectedOptions = getSelectedOptionMap(selectedVariant);
  selectedOptions.set(optionName, optionValue);

  const exactIndex = variants.findIndex((variant) =>
    variantMatchesOptions(variant, selectedOptions),
  );
  if (exactIndex >= 0) return exactIndex;

  return variants.findIndex(
    (variant) => getOptionValue(variant, optionName) === optionValue,
  );
}

function getSelectedOptionMap(variant: any) {
  const selectedOptions = new Map<string, string>();
  variant?.selectedOptions?.forEach((option: {name: string; value: string}) => {
    if (!isDefaultTitleOption(option)) {
      selectedOptions.set(option.name, option.value);
    }
  });
  return selectedOptions;
}

function variantMatchesOptions(
  variant: any,
  selectedOptions: Map<string, string>,
) {
  for (const [name, value] of selectedOptions.entries()) {
    if (getOptionValue(variant, name) !== value) return false;
  }
  return true;
}

function isDefaultTitleOption(option: {name: string; value: string}) {
  return (
    option.name.toLowerCase() === 'title' &&
    option.value.toLowerCase() === 'default title'
  );
}
