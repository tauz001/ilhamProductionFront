# Codex Handoff

## Repository State

- Current branch: `codex/storefront-performance-seo`
- Stable pre-Antigravity commit: `5f49de6`
- Antigravity snapshot branch: `codex/antigravity-snapshot`
- Antigravity snapshot commit: `fb8a1ec`
- Working baseline: `fb8a1ec`

## Approved Direction

- Preserve the existing Ilham visual design.
- Keep the floating WhatsApp control.
- Preserve the current order-detail loader and Admin API fallback.
- Keep and improve Find My Size with an accessible measurement diagram.
- Keep Lucknow `226xxx` same-day delivery and make its configuration explicit.
- Show the order feedback prompt only on the first order-detail visit per order.
- Add a click-loaded product Quick View with variant selection and View Details.
- Restore the pre-Antigravity font design, then optimize font delivery.
- Improve existing SEO, sitemap, favicon, and structured data rather than removing them.
- Add restrained, layout-stable loading feedback where it improves perceived speed.

## Confirmed Audit Findings

- Lenis and Framer Motion run from the persistent application shell.
- Primary navigation links mostly do not prefetch route data.
- The root mega-menu query requests 50 products with up to 20 variants each.
- Collection routes request up to 250 products with up to 50 variants each.
- About and Gifting LCP heroes are lazy-loaded through `ParallaxImage`.
- `ParallaxImage` renders separate mobile and desktop image elements.
- Product cards render up to three image elements before hover.
- PDP recommendations block the loader and gallery thumbnails load eagerly.
- Several indexable routes lack complete canonical/social metadata.
- Private and utility routes lack explicit `noindex` metadata.
- The favicon is remote/redirected and `public/` has no durable brand icon set.

## Protected Files And Behavior

- Do not revert the order-detail/Admin API implementation in
  `app/routes/account.orders.$id.tsx`.
- Do not remove `app/components/layout/FloatingWhatsApp.tsx`.
- Never commit `.env` or credentials.

## Completed

- Read-only repository, Git, performance, image, SEO, font, and feature audit.
- ESLint passed on the snapshot.
- TypeScript passed with `--noEmit --incremental false` on the snapshot.
- Created and committed the Antigravity recovery snapshot.
- Created the implementation branch.
- Removed the persistent-shell Lenis initialization.
- Reduced the root mega-menu product query to taxonomy fields only; it no
  longer requests product galleries, prices, or up to 1,000 variants.
- Added delayed route navigation feedback and reduced-motion CSS behavior.
- Added intent prefetch to primary Navbar, homepage, and product-card links.
- Deferred PDP recommendations behind layout-stable skeleton cards.
- ESLint and TypeScript passed after the performance foundation changes.
- Replaced the two-element mobile/desktop parallax implementation with one
  responsive `picture` resource selection.
- Marked About and Gifting hero images eager/high-priority with dimensions.
- Product cards now render one image initially, load the second on hover/focus,
  and request the third only when the gallery timer advances.
- Added shared Shopify CDN width/srcset helpers and applied bounded responsive
  widths to home, gifting, PDP gallery, thumbnails, zoom, and artisan imagery.
- ESLint and TypeScript passed after responsive image changes.
- Collection routes now request 24 products per page instead of 250.
- Collection cards use one selected variant plus variant counts and product
  options instead of up to 50 complete variants per product.
- Added on-demand Load More pagination with stable skeleton placeholders.
- URL-only collection filters no longer re-run the Storefront loader.
- Hydrogen GraphQL codegen and TypeScript passed after collection changes.
- Find My Size now supports Shopify product metafields `custom.audience`,
  `custom.fit_note`, and JSON `custom.size_chart` with a standard fallback.
- Added an accessible body-measurement diagram and measurement-specific help.
- Size recommendations require complete measurements and return an atelier-help
  state instead of forcing measurements into an undersized largest option.
- ESLint, Hydrogen codegen, and TypeScript passed after size-guide changes.
- Same-day delivery enablement, pincode prefixes, fallback fee, and Shopify
  service variant ID are configurable through documented environment variables.
- The bag can add an eligible same-day service as a real Shopify cart line with
  the checked pincode stored as a line attribute; Shopify variant price is the
  actual checkout charge.
- PDP delivery checks remain informational and do not add cart services.
- ESLint, Hydrogen codegen, and TypeScript passed after delivery changes.
- Removed the feedback prompt from Account Profile.
- Order Detail now claims the automatic prompt once per order and retains a
  permanent manual Share feedback control.
- The isolated feedback endpoint independently verifies signed-in ownership and
  stores prompt/submission state on `custom.order_feedback` for that order.
- Browser storage suppresses repeat prompts when Admin persistence is unavailable.
- The protected order-detail loader and Admin enrichment fallback were not changed.
- ESLint, Customer Account codegen, and TypeScript passed after feedback changes.

## In Progress

- Lazy product Quick View.

## Pending

- Image loading and responsive media.
- Find My Size redesign.
- Configurable same-day delivery and real Shopify charge integration.
- Per-order first-visit feedback prompt.
- Lazy Quick View.
- Font restoration and delivery optimization.
- SEO, sitemap, robots, structured data, and favicon completion.
- Full static, production-build, browser, performance, commerce, and SEO checks.

## Commands Run

- `npm.cmd run lint` - passed before snapshot.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed before snapshot.
- `git diff --check` - passed before snapshot.
- `npm.cmd run lint` - passed after performance foundation.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  performance foundation.
- `npm.cmd run lint` - passed after responsive image changes.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  responsive image changes.
- `npm.cmd run lint` - passed after collection pagination changes.
- `npm.cmd run codegen` - passed after collection pagination changes.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  generated collection query types were refreshed.
- `npm.cmd run lint` - passed after Find My Size changes.
- `npm.cmd run codegen` - passed after adding product guidance metafields.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  Find My Size changes.
- `npm.cmd run lint` - passed after same-day delivery changes.
- `npm.cmd run codegen` - passed after adding the delivery-service variant query.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  same-day delivery changes.
- `npm.cmd run lint` - passed after per-order feedback changes.
- `npm.cmd run codegen` - passed after adding feedback ownership query.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  per-order feedback changes.

## Next Step

Add a click-loaded Quick View route and modal so detailed variants and modal
code are requested only after Choose Piece, with Add to Bag and View Details.
