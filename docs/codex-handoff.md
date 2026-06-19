# Codex Handoff

## Repository State

- Current branch: `codex/luxury-motion-performance`
- Luxury-performance baseline commit: `d145425`
- Completed and pushed previous phase: `codex/storefront-performance-seo`
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

## Initial Audit Findings

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

## Luxury Motion Phase

### Approved Objective

- Make Ilham feel more beautiful, fluid, and intentionally luxurious while
  improving real and perceived mobile performance.
- Restore clearly visible editorial parallax without restoring duplicate image
  downloads or introducing scroll jank.
- Make Choose Piece / Quick View feel immediate.
- Use one coherent motion language for navigation, scrolling, drawers, modals,
  image reveals, and route feedback.
- Keep native touch scrolling responsive; richer desktop motion must not make
  mobile slower.
- Do not change protected order-detail/Admin behavior, cart correctness,
  WhatsApp, feedback semantics, SEO URLs, sitemap endpoints, or credentials.

### Confirmed Current Findings

- `ParallaxImage` was not removed. It still uses Framer Motion scroll transforms;
  duplicate desktop/mobile elements were replaced by one responsive `picture`.
- The persistent Lenis hook was removed in the previous phase. Native scrolling
  is objectively lighter, but the parallax can consequently feel flatter.
- The homepage hero carousel and Wedding hero are static editorial images; only
  selected home, About, and Gifting sections currently use `ParallaxImage`.
- Default parallax uses a 120% image with movement from -18% to +18%; the travel
  can exceed available overscan and should be rebuilt around measured bounds.
- Parallax images retain `will-change: transform` even when offscreen.
- First Quick View click is a sequential waterfall: load the modal JavaScript,
  mount it, then start a new Shopify API request.
- Quick View shows a small Suspense shell followed by a second full modal
  skeleton, which makes the delay feel longer.
- The Quick View query includes unused description/gallery data and up to 50
  variants; its response is private and only cached briefly.
- The root still blocks initial rendering on a 50-product taxonomy query for
  navigation, even though its payload is much smaller than the old version.
- Fixed SVG turbulence grain, persistent backdrop blur, permanent compositing,
  and many scroll observers can reduce frame stability on mobile devices.
- Motion durations are not yet governed by one system: some controls take
  700ms while editorial reveals take 1.1-1.4s.
- Blogs, policies, search, error, and other utility surfaces are less visually
  resolved than Home, About, Gifting, collections, and PDP.
- The in-app visual browser is currently blocked by the Windows process sandbox;
  implementation must include Oxygen Preview testing on real mobile/desktop
  browsers before production deployment.

### Implementation Order

1. Capture baseline performance traces and interaction videos on Home,
   collection, PDP, Quick View, bag, and navigation.
2. Make Quick View immediate by preloading its small module, prefetching data on
   intent, running module/data work in parallel, rendering from card data first,
   trimming GraphQL, and caching public product responses safely.
3. Introduce motion tokens for fast controls, medium overlays, and slow
   editorial movement; remove inconsistent timings.
4. Restore adaptive Lenis only for desktop wheel/fine-pointer users, with RAF
   cleanup, visibility/modal pausing, reduced-motion support, and native touch
   scrolling on mobile.
5. Rebuild parallax with measured overscan, device-specific strength,
   intersection-based activation, and active-only `will-change`; add restrained
   movement to suitable hero/editorial sections.
6. Remove runtime costs: defer/remove the critical root product query, simplify
   grain and blur, reduce offscreen observers, and review font/image decode work.
7. Extend the Ilham visual system to utility/editorial pages and loading, empty,
   and error states without animating every element.
8. Validate slow network, touch, keyboard, reduced motion, iOS Safari, Android
   Chrome, desktop Chrome, cart/checkout, SEO, and protected order behavior on
   Oxygen Preview before production.

### Continuity Protocol

- Update this file after every meaningful implementation and verification step.
- Record the exact branch, commit, tests, discovered issues, and next action.
- Commit small independent checkpoints so work can resume safely after any chat
  interruption or context limit.
- At the start of a new chat: read this file, inspect Git status and recent
  commits, then continue from `Next Step` without repeating completed work.

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
- Added an API route that fetches Quick View product details and variants only
  after a product handle is explicitly requested.
- ProductCard dynamically imports the Quick View modal only after Choose Piece.
- Quick View supports grouped variant selection, Add to Bag, responsive imagery,
  Escape/outside-click close, loading/error states, and prefetched View Details.
- Moved shared PDP/Quick View variant-option selection into
  `app/lib/commerce/selected-variant.ts`.
- ESLint, Hydrogen codegen, and TypeScript passed after Quick View changes.
- Restored stable typography roles: Italiana display, Cormorant Garamond serif,
  Inter Tight UI/body, and Noto Nastaliq Urdu.
- Restored the pre-Antigravity light body/heading weights and letter spacing.
- Removed Google Font CSS imports from application styles; root now preconnects
  and loads a trimmed set of used faces through a document stylesheet link.
- ESLint and TypeScript passed after font restoration.
- Added shared canonical, description, Open Graph, and Twitter metadata across
  public storefront, collection, product, blog, page, and policy routes.
- Added explicit `noindex` metadata to account, bag/cart, auth, search, and
  checkout routes.
- Added truthful Product and Article structured data plus article breadcrumbs;
  removed unverified shipping and return promises from Product schema.
- Preserved `/sitemap.xml` and `/sitemap.static.xml`; the static sitemap now
  covers custom and virtual routes while Shopify's sitemap owns real resources.
- Added a permanent redirect from the legacy `/collections/wedding` URL to the
  canonical `/collections/wedding-edit` URL.
- Replaced the remote Hydrogen favicon with same-origin Ilham PNG icons and a
  local web manifest, and removed the unused Hydrogen SVG asset.
- Hydrogen codegen, ESLint, TypeScript, and diff validation passed after SEO
  and favicon changes.
- Aligned Hydrogen's default Storefront API market context with India (`IN`)
  instead of the scaffolded United States default.

## In Progress

- Planning and continuity setup for the luxury motion/mobile performance phase.
- No luxury-motion implementation code has been changed yet.

## Pending

- The full eight-step luxury motion/mobile implementation and QA sequence above.
- Set `SAME_DAY_DELIVERY_VARIANT_ID` in the local/Oxygen environment after the
  hidden Shopify service product exists; until then eligibility is shown but
  the paid add-on is intentionally unavailable.
- Authenticated first-visit feedback UI can only be exercised with a real
  customer order session. Static checks, codegen, and TypeScript pass.

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
- `npm.cmd run lint` - passed after lazy Quick View changes.
- `npm.cmd run codegen` - passed after adding Quick View product query.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  lazy Quick View changes.
- `npm.cmd run lint` - passed after font restoration.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  font restoration.
- `npm.cmd run codegen` - passed after SEO query changes.
- `npm.cmd run lint` - passed after SEO and favicon changes.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after SEO
  and favicon changes.
- `git diff --check` - passed after SEO and favicon changes.
- `npm.cmd run build` - production client and Oxygen SSR bundles passed after
  the complete performance, feature, font, and SEO work.
- `npm.cmd run lint` - passed after the India market-context correction.
- `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after the
  India market-context correction.
- Final `npm.cmd run build` - passed after the India market-context correction.
- Live home returned 200 with canonical/Open Graph metadata and site JSON-LD.
- Live Women collection returned 24 products with canonical metadata and
  ItemList schema.
- Live PDP returned Product/Breadcrumb schema and the Find My Size control.
- Live Quick View returned the requested product and its two real variants.
- Anonymous add-to-bag returned 200, a cart cookie, and quantity-one bag data.
- Bag, login, and search rendered explicit `noindex` metadata.
- Both sitemap endpoints, robots, manifest, brand icon, and legacy favicon and
  wedding redirects returned their expected HTTP responses.
- Delivery API confirmed `226001` eligible at the configurable INR 30 fallback
  and `110001` ineligible; Shiprocket serviceability returned successfully.
- The in-app browser helper could not launch because Windows denied its sandbox
  process, so visual interaction QA was replaced with rendered-HTML and live
  HTTP verification.

## Next Step

Commit and push this continuity checkpoint. Then capture the performance and
interaction baseline on the current Oxygen Preview build. Implement the Quick
View latency fix first in a small independently tested commit; do not start by
globally restoring the old always-on Lenis hook.
