# Homepage Category Strip

The homepage category strip is controlled from Shopify. No environment
variable, Admin API token, or new deployment is required when categories are
added, removed, or reordered later.

## 1. Categorize Products

In each Shopify product, set **Product organization > Product type** to a short,
consistent customer-facing value, for example:

- Short Kurti
- Long Kurti
- Anarkali
- Kurta Set
- Saree
- Men Kurta

The storefront uses Product Type for the collection-page **Category** filter.
Spelling and capitalization should be identical across matching products.

## 2. Create Category Collections

Create an automated Shopify collection for every category that should appear on
the homepage. Use the condition **Product type is equal to** the relevant value.

Examples:

- Collection `Short Kurtis` -> Product type equals `Short Kurti`
- Collection `Long Kurtis` -> Product type equals `Long Kurti`

Add a collection image when possible. If a collection has no image, the
storefront uses the first product's featured image.

## 3. Control The Homepage Strip

In Shopify Admin, create a navigation menu named **Homepage categories** with
the handle `homepage-categories`.

Add collection links to that menu in the order they should appear. The
storefront shows up to seven valid collection links. Changing the menu updates
the homepage without a code change.

Only collection links with an available collection image or first-product image
are shown. Missing or incomplete entries leave no empty space.
