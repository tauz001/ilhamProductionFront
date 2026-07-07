# ilham's wall Handoff

## Feature

Build `ilham's wall`: a premium sticky-note customer review wall at
`/ilhams-wall`, backed by Shopify-native data where practical.

## Intended Scope

- Public wall page with approved customer reviews only.
- Sticky-note UI using lightweight CSS, tape details, subtle chikankari motif,
  lazy images, limited initial load, and load-more pagination.
- Verified customer submission flow for delivered orders.
- Short note, one optional customer photo, consent, pending approval.
- Customer name, product title/link, order reference, date, approval status, and
  note style seed are generated server-side.
- Private invite-link submission flow for customers who bought through
  WhatsApp, Instagram, offline, or another channel and may not have a listed
  Shopify storefront order.

## Storage Direction

- Shopify metaobject type: `ilham_wall_review`.
- Shopify metaobject type: `ilham_wall_invite` for one-time private review
  links.
- Shopify Files for optional customer photo upload.
- Pending reviews are created as metaobjects with `status=pending`; public page
  only reads `status=approved`.

## Files Created/Changed

- Created: `CODEX_HANDOFF_ILHAMS_WALL.md`.
- Created: `app/lib/commerce/ilhams-wall.server.ts`.
- Created: `app/lib/commerce/wall-photo.ts`.
- Created: `app/routes/ilhams-wall.tsx`.
- Created: `app/routes/ilhams-wall_.review.tsx`.
- Edited: `app/components/layout/Footer.tsx`.
- Edited: `app/lib/seo.ts`.
- Edited: `app/routes/[sitemap.static.xml].tsx`.

## Current Implementation Status

- Handoff created before main coding and updated after implementation.
- `/ilhams-wall` route is implemented with loader/action, public sticky-note
  wall, verified-customer submission form, optional client-side image
  compression, and SEO/breadcrumb metadata.
- Server helper is implemented for approved metaobject reads, verified customer
  delivered-order eligibility, pending metaobject creation, and optional Shopify
  Files upload.
- `/ilhams-wall/review?invite=...` route is implemented for one-time invite
  links. It does not require login, uses the invite metaobject handle as the
  token, optionally falls back to a logged-in customer's display name, creates a
  pending review, then marks the invite used.
- Browser-side photo compression is shared by the logged-in wall form and the
  invite form.
- Footer, site-navigation JSON-LD, and static sitemap include `/ilhams-wall`.
- Invite-link implementation verification passed.

## Completed

- Confirmed current branch is clean before feature work.
- Confirmed existing private Admin token pattern is used by order feedback and
  discount ticket code.
- Added performance-safe initial pagination (`18` notes, max `30`) and lazy
  customer photos.
- Added approval gate: only reviews with `status=approved` appear publicly;
  customer submissions create `status=pending`.
- Customer name is not collected in the form; it is generated from signed-in
  customer account first name and last initial.
- Added no-login invite flow:
  - Staff creates an `ilham_wall_invite` metaobject in Shopify Admin.
  - The invite metaobject handle is the private token.
  - Send customer:
    `https://ilhamchikankari.com/ilhams-wall/review?invite=INVITE_HANDLE`
  - Customer submits note/photo/consent without logging in.
  - Review is saved as `status=pending`.
  - Invite is marked `used=true` only after the review is saved.
- Invite-link verification passed:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run build`
  - `git diff --check`
- Verification passed:
  - `npm.cmd run codegen`
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - `npm.cmd run build`
  - `git diff --check`
  - Protected diff check for order detail, feedback API, checkout, main
    sitemap/robots, WhatsApp, add-to-cart, and `.env`.

## Pending

- Commit and push checkpoint.

## Environment Variables Needed

- `PRIVATE_SHOPIFY_ADMIN_API_TOKEN`
- `PUBLIC_STORE_DOMAIN`

## Shopify-Side Setup Required

- Create a custom/private app token for the exact store domain.
- Required Admin API scopes:
  - `read_orders`
  - `read_metaobjects`
  - `write_metaobjects`
  - `read_files`
  - `write_files`
- Create metaobject definition `ilham_wall_review` with these fields:
  - `status` (single-line text: `pending`, `approved`, or `rejected`)
  - `note` (single-line or multi-line text)
  - `customer_display_name` (single-line text)
  - `reviewed_at` (date and time)
  - `product_title` (single-line text)
  - `product_url` (URL or single-line text)
  - `product_handle` (single-line text)
  - `order_id` (single-line text)
  - `order_name` (single-line text)
  - `line_item_id` (single-line text)
  - `style_seed` (integer or single-line text)
  - `photo` (file reference, optional)
- Create metaobject definition `ilham_wall_invite` with these fields:
  - `token` (single-line text, optional but useful; can match handle)
  - `buyer_display_name` (single-line text)
  - `product_title` (single-line text, required)
  - `product_url` (URL or single-line text, optional)
  - `product_handle` (single-line text, optional)
  - `source` (single-line text, optional: WhatsApp, Instagram, offline, etc.)
  - `order_id` (single-line text, optional)
  - `order_name` (single-line text, optional)
  - `line_item_id` (single-line text, optional)
  - `expires_at` (date and time, optional)
  - `used` (boolean, required; set to false for new invites)
  - `status` (single-line text, optional; use `active` or leave blank)
- For each buyer invite, set the metaobject handle to a private token such as
  `tauz-noor-20260707`, then send
  `/ilhams-wall/review?invite=tauz-noor-20260707`.
- Make approved metaobjects readable by the Admin token. Public storefront access
  is not required because Hydrogen reads server-side.

## Known Issues

- Earlier diagnostics showed the current local Admin token returns HTTP 401 for
  basic Admin GraphQL against `qvkgah-er.myshopify.com`. The wall will fail
  safely until a valid token is provided.
- The wall eligibility query intentionally does not use the `#graphql` marker in
  `app/lib/commerce/ilhams-wall.server.ts`; Hydrogen codegen validates that
  marker against the Storefront schema, while this query is sent to the Customer
  Account API at runtime.
- Shopify Admin API `metaobjects.sortKey` expects a string value. Use
  `sortKey: "updated_at"` in the wall query; `sortKey: UPDATED_AT` returns a
  GraphQL validation error and makes the wall appear empty.
- Sticky note visual identity must be stable per review. Permanent style values
  such as note color, rotation, tape position, tape width, tape opacity, and tape
  rotation should depend on a stable review-specific seed, not the review's grid
  index. Review grid position/order may change when newer reviews are added.
- Manual reviews can accidentally reuse the same `style_seed`, so the wall route
  combines review `id` with `style_seed` for visual styling. This keeps existing
  notes stable while making each note look more distinct.
- Invite links use a handle-filtered `metaobjects` Admin query, so the invite
  token must be the `ilham_wall_invite` metaobject handle. The optional `token`
  field is display context only; the code does not scan all invites by token.

## Next Exact Steps

1. Commit and push only the wall invite files; do not stage `.env` or unrelated
   `HANDOFF.md`.

## Continue If Codex Session Ends

Read this file, inspect `git status --short --branch`, then continue from
`Next Exact Steps` without repeating completed work. Preserve order-detail/Admin
API behavior, feedback API semantics, checkout, WhatsApp, sitemap/robots, and do
not commit `.env` or credentials.
