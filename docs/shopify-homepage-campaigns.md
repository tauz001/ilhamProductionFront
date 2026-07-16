# Shopify Homepage Campaigns

The Hydrogen homepage has two fixed optional campaign positions:

- `slot-1`: after the hero heritage marquee and before the atelier story.
- `slot-2`: after the Women/Men edit and before the Wedding edit.

Each slot can show a banner, a product rail, both, or nothing. Once the Shopify
definition exists, campaign content can be changed without editing code or
deploying Hydrogen.

## One-Time Metaobject Definition

In Shopify Admin, go to **Settings > Metafields and metaobjects > Add
definition**.

- Name: `Homepage campaign`
- Type: `homepage_campaign`
- Storefront API access: on
- Active-draft status: on
- Publish entries as web pages: off

Add these fields using the exact keys shown below:

| Field label | Key | Shopify field type | Required |
| --- | --- | --- | --- |
| Enabled | `enabled` | True or false | Yes |
| Show banner | `show_banner` | True or false | Yes |
| Desktop image | `desktop_image` | File, images only | For a banner |
| Mobile image | `mobile_image` | File, images only | Optional |
| Image alt | `image_alt` | Single line text | Recommended |
| Banner eyebrow | `banner_eyebrow` | Single line text | Optional |
| Banner title | `banner_title` | Single line text | Optional |
| Banner subtitle | `banner_subtitle` | Multi-line text | Optional |
| Banner link label | `banner_link_label` | Single line text | Optional |
| Banner link | `banner_link` | Single line text | Optional |
| Text theme | `text_theme` | Single line text | Optional |
| Show rail | `show_rail` | True or false | Yes |
| Rail title | `rail_title` | Single line text | Optional |
| Rail subtitle | `rail_subtitle` | Single line text | Optional |
| Product tag | `product_tag` | Single line text | For a rail |
| Product limit | `product_limit` | Integer | Optional |
| Product sort | `product_sort` | Single line text | Optional |
| Rail link label | `rail_link_label` | Single line text | Optional |
| Rail link | `rail_link` | Single line text | Optional |
| Start at | `start_at` | Date and time | Optional |
| End at | `end_at` | Date and time | Optional |

Recommended preset choices:

- `text_theme`: `light`, `dark`
- `product_sort`: `newest`, `best-selling`, `price-low`, `price-high`, `title`

`product_limit` defaults to 8 and is always restricted to 2-12 products for
performance. `mobile_image` falls back to `desktop_image` when left empty.

## Create The Two Entries

Go to **Content > Metaobjects > Homepage campaign** and create two Active
entries. Set their handles with the handle pencil control:

1. `slot-1`
2. `slot-2`

The handles are fixed and must match exactly. Entry display names can be more
descriptive, such as `Summer sale - top` and `Festive edit - middle`.

## Common Configurations

### Banner And Product Rail

- `enabled`: true
- `show_banner`: true
- Add desktop/mobile images and optional copy/link.
- `show_rail`: true
- `product_tag`: for example `summer-sale`
- Add the same tag to every Shopify product that should appear.

### Banner Only

- `enabled`: true
- `show_banner`: true
- `show_rail`: false

### Product Rail Only

- `enabled`: true
- `show_banner`: false
- `show_rail`: true
- Fill `product_tag`.

### Hide A Slot

Set `enabled` to false, set the entry to Draft, or delete the entry. No empty
space is rendered.

## Scheduling And Safety

- A future `start_at` keeps the whole slot hidden until that time.
- At `end_at`, the whole slot hides automatically.
- Invalid dates or an end time before the start time fail closed and hide the
  campaign.
- A missing banner image hides only the banner.
- A missing/empty product tag hides the rail.
- A valid banner remains visible if its rail has no matching products.
- Products are requested only for enabled, scheduled rails with a valid tag.
- Product rails reuse the shared storefront cards, including sale pricing,
  colour listings, sold-out treatment, hover images, and Quick View.

Use internal links such as `/collections/women` or complete `https://` URLs.
Campaign changes are read through Shopify's Storefront API and can take a short
cache interval to appear; no Oxygen deployment is required for content edits.
