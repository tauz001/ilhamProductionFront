# Codex Handoff

## Repository State

- Current branch: `codex/premium-discount-experience`
- Luxury-performance baseline commit: `d145425`
- Latest luxury implementation commit: `1f6f2c7`
- Real-time order tracking implementation commit: `c8f7050`
- Premium discount/PDP trust implementation commit: `1a7a829`
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

## Real-Time Order Tracking Phase

### Approved Objective

- Add a public, no-index `Track My Order` page with a refined shipment timeline.
- Accept a Shiprocket AWB directly, or a Shopify order number plus the matching
  order email; never allow guessable order-number-only lookups.
- Resolve order fulfillment/AWB server-side through Shopify Admin, then request
  current carrier scans from Shiprocket on every lookup with `no-store` caching.
- Return only sanitized shipment status, carrier, AWB, ETA, tracking URL, and
  scan events. Never return customer names, email, phone, address, payment data,
  credentials, or raw provider payloads.
- Preserve the protected order-detail/Admin loader, feedback behavior, cart,
  WhatsApp, SEO URLs, sitemap endpoints, and all existing credentials.

### Implementation Order

1. Save and push this branch/handoff recovery checkpoint.
2. Add a server-only Shopify/Shiprocket tracking service with input validation,
   email ownership verification, sanitized normalization, and provider errors.
3. Add the public `/track-order` form and responsive luxury timeline UI.
4. Add restrained discovery links without indexing the private utility route.
5. Validate live provider contracts without logging or exposing PII/secrets,
   then run lint, clean TypeScript, diff checks, and the production build.

## Premium Discount / PDP Trust Phase

### Approved Objective

- Add a premium copyable discount-ticket surface on PDP and bag/cart pages.
- Fetch the displayed code from Shopify Admin discounts; do not hardcode a
  storefront code in React, loaders, or environment files.
- Keep the ticket hidden if the Admin token/scope is unavailable rather than
  showing a stale or fake offer.
- Add PDP trust copy below the product description for shade variation and
  transparent chiffon/georgette fabric guidance.
- Improve sale/anchor pricing so sale products show compare-at price, sale
  price, and percentage saved, and cart/bag shows total compare-at savings.
- Refresh the footer to remove the remote/blue logo dependency and improve
  refund-policy discovery.
- Preserve protected order-detail/Admin API behavior, feedback semantics, cart
  correctness, WhatsApp, SEO URLs, sitemap endpoints, and credentials.

### Implementation Order

1. Add a server-only Shopify Admin discount reader using `discountNodes` with
   graceful no-offer behavior when `read_discounts` is missing.
2. Add a shared premium discount-ticket component for PDP, bag/cart, and the
   cart drawer.
3. Add pricing helpers for compare-at/anchor savings and wire them into PDP,
   product cards, bag lines, and summary totals without changing cart actions.
4. Add PDP shade/fabric guidance using existing product metafields/options.
5. Refine footer/logo and policy links; rely on Shopify's real refund policy
   route where possible.
6. Run codegen, lint, TypeScript, diff checks, and build; commit and push a
   checkpoint.

### Current Notes

- Shopify Admin `discountNodes` requires `read_discounts`; the existing
  private Admin token will need that scope in Oxygen/local `.env` before the
  ticket can render real codes.
- The work starts from clean pushed order-tracking commit `970bb9d`.
- Implemented the first pass locally: server-only Shopify discount reader,
  copy/apply ticket UI, PDP and bag/cart ticket slots, compare-at sale pricing,
  cart compare-at savings, chiffon/georgette PDP guidance, footer refund links,
  and `/refund-policy` redirect.
- Discount-ticket selection is controlled by `DISCOUNT_TICKET_TAG`
  (default/example `storefront-ticket`). The reader now prefers a matching
  Shopify discount tag, then falls back to matching active code discount code or
  title so an env value like `New-Customer` works even when it is the code/title
  rather than a tag.
- Local verification passed: codegen, lint, clean TypeScript, diff checks,
  production build, client-secret scan, `.env` ignore check, and protected-file
  audit.
- Implementation committed as `1a7a829` on `codex/premium-discount-experience`.
- Branch was pushed to `origin/codex/premium-discount-experience` after the
  handoff checkpoint `b1d8ff3`.

## Sold-Out Merchandising Phase

### Approved Objective

- Add a subtle sold-out treatment to shared product cards so unavailable pieces
  remain visible but feel intentional and premium.
- Keep sold-out products at the very end of storefront listing grids unless the
  customer explicitly filters to in-stock only.
- Make homepage New Arrivals prioritize the most recent Shopify products first
  before applying the existing `new-arrival` / `new` tag filter.
- Preserve cart correctness, ProductCard quick-view semantics, WhatsApp,
  protected order-detail/Admin API behavior, feedback, SEO URLs, sitemap
  endpoints, and credentials.

### Current Notes

- Started from a clean pushed `codex/premium-discount-experience` branch at
  `ff90d82`.
- Inspection confirmed `ProductCard` already receives variant availability in
  the main collection/homepage paths, but it does not visually mark sold-out
  products.
- The main collection route currently supports an `In stock only` filter; the
  merchandising change should preserve that filter while default browsing ranks
  sold-out products last.
- The homepage New Arrivals rail currently uses `products(first: 12)` and then
  filters by tag, so the query should request recent products first.
- Implemented locally: shared product availability helper, subtle sold-out
  overlays for shared product cards, sold-out cards routed to View Details,
  main collection availability-first sorting, homepage recent-first product
  query, and `/collections/all` availability/recent-first treatment.
- Verification passed: codegen, lint, clean TypeScript, diff checks, production
  build, and protected-file diff audit.

## WhatsApp Trust Nudge Phase

### Approved Objective

- Make the floating WhatsApp control more noticeable and trust-building without
  changing its existing link behavior.
- Add restrained pulse/floating motion plus a small guidance tooltip for size,
  delivery, and styling help.
- Keep the effect lightweight, CSS-only, and respectful of reduced-motion
  preferences.

### Current Notes

- Implemented locally: the existing floating WhatsApp component now keeps its
  current href/target fallback, adds a small guidance tooltip, a gold trust dot,
  a soft pulse layer, and a slow float animation.
- Verification passed: lint, clean TypeScript, diff checks, production build,
  and protected-file scope review.
- Follow-up refinement in progress: tooltip text now rotates every 10 seconds
  across Need Size Help, Fabric Details, Available Colors, Delivery Time,
  Customize Color, and Chat on WhatsApp; pulse visibility was increased with
  two staggered gold rings and a soft glow.
- Follow-up verification passed: lint, clean TypeScript, diff checks,
  production build, and protected-file scope review.

## Variant Image Handling Phase

### Approved Objective

- Keep the current PDP and cart design almost unchanged while correcting
  selected Shopify variant behavior.
- PDP variant selection should preserve compatible options, use the selected
  Shopify variant ID for Add to Cart, and show the selected variant image first
  when Shopify provides one.
- Bag drawer/page should continue using the cart line's `merchandise.image` and
  show the selected variant options cleanly under the product title.
- Do not duplicate collection cards by color, do not redesign PDP/cart, do not
  customize checkout, and do not add heavy gallery filtering.

### Current Notes

- Started from clean pushed `codex/premium-discount-experience` at `56113ac`.
- Inspection confirms PDP already queries variant image/selectedOptions/price
  and Add to Cart already submits `selectedVariant.id`.
- Inspection confirms cart fragments already query `line.merchandise.image` and
  `line.merchandise.selectedOptions`.
- Current gaps: PDP variant state is local only, the carousel does not
  prioritize selected variant image, and bag lines show only `Size` instead of
  the full selected option set.
- Implemented locally: PDP selected variant now syncs from URL option search
  params, option clicks update those params without scroll reset, the existing
  carousel prioritizes `selectedVariant.image` and resets to it when the
  selected color image changes, and bag drawer/page lines render the full
  selected option values while linking back to the selected variant URL.
- Cart line imagery remains sourced from `line.merchandise.image`; checkout is
  untouched and still depends on Shopify Admin variant image assignment.
- Verification passed: lint, clean TypeScript, diff checks, production build,
  and protected-file scope review. Checkout customization was intentionally not
  attempted.

## PDP Deferred Discount Stability Phase

### Approved Objective

- Fix delayed PDP 500s that appear after initial render without changing PDP
  design or checkout/cart behavior.
- Keep the Shopify Admin-backed discount ticket optional: if the Admin lookup
  fails, the ticket should hide rather than crash the product page.

### Current Notes

- Screenshot showed PDP rendering first, then switching to the route error
  boundary after several seconds. That timing points to a deferred `<Await>`
  promise rejection rather than the main product loader.
- The PDP deferred `discountOffer` uses `fetchFeaturedDiscountOffer`; its cache
  side-effect handled rejections, but the returned promise could still reject
  and bubble into the route boundary.
- Implemented locally: `fetchFeaturedDiscountOffer` now catches Admin/network
  lookup failures and resolves `null`, so the ticket hides and the storefront
  stays open.
- Verification passed: `npm.cmd run lint`, clean TypeScript
  `node_modules\.bin\tsc.cmd --noEmit --incremental false`,
  `git diff --check`, and `npm.cmd run build`.
- Scope check passed: only `app/lib/commerce/discount-ticket.server.ts` and
  this handoff changed; protected order-detail/Admin, feedback API, checkout,
  WhatsApp, sitemap/robots, and `.env` surfaces were untouched.

## Mobile Color Selection Scroll Phase

### Approved Objective

- On mobile PDP, when a customer selects a color that changes the product image,
  take them back to the image gallery so the selected shade is visible.
- Keep desktop PDP behavior, size selection, Add to bag, cart, checkout, and
  design unchanged.

### Current Notes

- Implemented locally: the PDP gallery wrapper now has a ref, and selecting a
  `Color`/`Colour` option scrolls to that gallery on screens below `md`.
- Size selection and non-color options continue to update the selected variant
  without scrolling.
- The scroll honors `prefers-reduced-motion` by using an instant jump instead
  of smooth scrolling for reduced-motion users.
- Verification passed: `npm.cmd run lint`, clean TypeScript
  `node_modules\.bin\tsc.cmd --noEmit --incremental false`,
  `git diff --check`, and `npm.cmd run build`.

## Route Scroll And Announcement Bar Phase

### Approved Objective

- Fix in-site navigation preserving the previous page's scroll position, e.g.
  opening a PDP or Contact from a scrolled Home page.
- Check for the same issue globally and fix route-path navigation without
  disturbing PDP variant query changes, collection filters, or browser
  back/forward scroll restoration.
- Make the top announcement bar Shopify-controlled, clickable, and more
  noticeable while keeping a safe fallback if Shopify setup is missing.

### Current Notes

- Implemented locally: `PageLayout` now runs a route-path scroll reset on
  non-POP navigation and dispatches a Lenis reset event so desktop smooth
  scrolling cannot retain the old page offset.
- The reset skips hash links and same-path search-param updates, preserving PDP
  color/size query updates and collection filter behavior.
- Implemented locally: root `HEADER_QUERY` now fetches Shopify menu handle
  `announcement-bar`; `Navbar` uses those menu item titles/URLs as rotating
  announcement messages.
- Announcement links normalize internal store URLs to React Router links and
  leave true external URLs as normal anchors.
- Visual update: announcement bar is now a darker ink/gold strip with a glow dot
  and `Explore` cue so it is easier to notice.
- Verification passed: `npm.cmd run codegen`, `npm.cmd run lint`, clean
  TypeScript `node_modules\.bin\tsc.cmd --noEmit --incremental false`,
  `git diff --check`, and `npm.cmd run build`.

## PDP Deferred Crash Hardening And Soft Scroll Phase

### Approved Objective

- Prioritize the reported PDP crash on
  `/products/gulnaz-chikankari-sharara-set`.
- Keep the PDP open even if optional deferred sections fail after initial
  render.
- Soften the route scroll reset so navigating from a scrolled page feels like a
  short scroll-to-top instead of a hard reload/jump.

### Current Notes

- Live production check on `https://ilhamchikankari.com/products/gulnaz-chikankari-sharara-set`
  returned HTTP 200 initially, matching the report that the PDP appears and then
  falls into the route error boundary.
- Live asset inspection showed the deployed `products._handle` bundle does not
  contain the previous non-fatal discount-ticket fix or mobile color-scroll code,
  so production is still serving an older PDP bundle until the next deploy.
- Implemented locally: PDP discount ticket and recommendations are wrapped in a
  small error boundary plus `<Await errorElement={null}>`, so optional deferred
  failures hide that section rather than crashing the product route.
- Implemented locally: recommendation results are sanitized before rendering
  product cards.
- Implemented locally: route scroll reset now uses smooth scroll on normal
  navigation and instant scroll only for reduced-motion users; Lenis receives the
  same smooth reset event.
- Verification passed: `npm.cmd run lint`, clean TypeScript
  `node_modules\.bin\tsc.cmd --noEmit --incremental false`,
  `git diff --check`, and `npm.cmd run build`.

## Page Transition Recommendations And Ticket Diagnosis Phase

### Approved Objective

- Make every route change feel smoother instead of hard-loaded.
- Keep PDP recommendations working even when Shopify's recommendation endpoint
  returns no products or a malformed item.
- Find why the Shopify-backed discount ticket is not showing and harden the code
  where possible.

### Current Notes

- Implemented locally: global route content is now wrapped in a Framer Motion
  page transition keyed by pathname, with reduced-motion support.
- Implemented locally: PDP recommendations now fall back to recent Shopify
  products if `productRecommendations` returns empty, excluding the current
  product.
- Implemented locally: each recommended product card is isolated in a small error
  boundary so one bad item cannot take down the whole rail.
- Implemented locally: discount ticket lookup now quotes hyphenated selectors
  such as `New-Customer`, removes the unsupported tag-first dependency, and
  scans active code discounts by title/code/summary when exact Shopify search
  returns nothing.
- Diagnostic result: `.env` has `DISCOUNT_TICKET_TAG=New-Customer` and a
  Shopify-shaped private Admin token, but even a basic Admin GraphQL `shop`
  query returned HTTP 401 for `qvkgah-er.myshopify.com`. This means the ticket
  cannot fetch real discounts until the Oxygen/local `PRIVATE_SHOPIFY_ADMIN_API_TOKEN`
  belongs to this exact store and has `read_discounts`.
- Verification passed: `npm.cmd run codegen`, `npm.cmd run lint`, clean
  TypeScript `node_modules\.bin\tsc.cmd --noEmit --incremental false`,
  `git diff --check`, and `npm.cmd run build`.

## Completed

- Removed the 50-product/30-collection layout query from the root critical
  loader and initial document. Static navigation remains immediate.
- Added a shared intent-loaded `/api/layout-commerce` endpoint with long Shopify
  caching, CDN stale-while-revalidate caching, and one browser promise/cache.
- Mega-menu hover/focus, search, and wishlist now initiate the catalog request;
  stable seed links and luxury skeletons render while it resolves.
- Restored lightweight product image and minimum-price fields that search and
  wishlist expected but the earlier stripped root query no longer provided.
- Live verification returned 12 products, 4 collections, valid images/prices,
  and a 7,966-byte intent response. Initial home HTML dropped from 133,582 to
  131,894 bytes and no longer executes the catalog query.
- One cold dev-server timing run stalled in Shopify for two minutes and was
  discarded as invalid performance evidence; structural/query checks passed.
- Hydrogen codegen, ESLint, clean TypeScript, diff validation, live endpoint
  verification, and the production client/Oxygen build passed.
- Added shared motion duration tokens for controls, feedback, overlays, reveals,
  and editorial movement; Quick View, drawers, search overlay, and reveal
  components now use the coherent timing scale.
- Restored smooth wheel/trackpad behavior adaptively: Lenis is dynamically
  imported only on desktop fine-pointer devices, never smooths touch, respects
  reduced motion, pauses for drawers/hidden tabs, ignores nested modal scrolling,
  and cancels its RAF/listeners correctly.
- The production client isolates Lenis into a separate 5.36KB-gzip chunk, so
  native mobile/touch users do not download it.
- Rebuilt `ParallaxImage` with mathematically bounded image overscan, restrained
  mobile strength, richer desktop strength, reduced-motion fallback, responsive
  source selection, and active-only `will-change` near the viewport.
- Removed conflicting hard-coded 150-175% image heights and added restrained
  parallax to the homepage Wedding editorial section.
- ESLint, clean TypeScript, diff validation, and the production client/Oxygen
  build passed after the adaptive motion and parallax changes.
- Recorded local Shopify-backed baseline timings before luxury-phase edits:
  Home cold 2.84s / warm 0.10s TTFB; Quick View API cold 0.19s / warm
  0.03s. These are development diagnostics, not production Web Vitals.
- Removed the Quick View first-click waterfall: its small JavaScript module is
  scheduled during browser idle time, while product data is prefetched on
  pointer/focus intent and shared through an in-memory promise cache.
- Quick View now opens at full size immediately with the card's real image,
  title, subtitle, and price while only variant options resolve.
- Replaced the two-stage tiny-shell/full-skeleton transition with one stable
  modal presentation, added body scroll locking, initial dialog focus, and a
  useful full-product fallback when variant loading fails.
- Trimmed unused Quick View GraphQL description/gallery data and added a short
  public stale-while-revalidate response policy. Live JSON payload dropped from
  2,697 bytes to 1,971 bytes for the verified product.
- Hydrogen codegen, ESLint, TypeScript, diff validation, live endpoint checks,
  and a production client/Oxygen build passed after the Quick View changes.
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
- Removed fullscreen grain rendering below tablet width and reduced its desktop
  opacity, avoiding a fixed blend/compositing layer on phones.
- Replaced mobile fullscreen backdrop blur with opaque ivory surfaces across
  navigation, search, product overlays, collection controls, gifting, and
  feedback while retaining restrained blur from tablet/desktop breakpoints.
- Normalized the mobile menu to shared feedback/overlay timing tokens and
  shorter stagger delays, and locked background scroll while any drawer is open.
- Replaced unstyled Shopify scaffold markup on journal, article, policy, generic
  page, all-products, pagination, and error surfaces with the existing Ilham
  type, spacing, color, and motion-token system.
- Added reusable server-rendered editorial headers and CSS-only rich-text rules;
  this consistency pass adds no route query, client state, or animation runtime.
- Added accurate responsive image sizing and restrained CSS hover treatment to
  article and all-products cards while preserving their existing destinations.
- Static Git audit from `d145425..5e2e66a` confirms no luxury-phase change to
  order detail/Admin, feedback API, cart/bag, SEO helper, robots, or sitemap
  files. WhatsApp keeps the same href/target behavior; only its mobile surface
  styling changed to avoid blur compositing.
- Confirmed `.env` remains ignored and untracked; only `.env.example` is tracked.
- Corrected the shared parallax wrapper positioning conflict that caused
  absolute hero image layers to collapse after deployment.
- Product cards now expose one stable alternate image only during genuine
  non-touch hover or keyboard focus; the three-second gallery rotation and
  third card-image request were removed.
- Added a dedicated 520ms modal timing with smaller transform travel and subtle
  scale settling for Quick View, Find My Size, and feedback. Quick View exit is
  now retained by a parent `AnimatePresence` instead of being cut off on unmount.
- Added a shared product availability helper and subtle sold-out overlays to
  shared storefront product cards; sold-out cards now guide customers to product
  details instead of purchase/quick-view actions.
- Main collection listings and `/collections/all` now rank available pieces
  before sold-out pieces while preserving the chosen price/new/featured order
  inside each availability group.
- Homepage product sourcing now requests recent Shopify products first so the
  New Arrivals rail feels freshly merchandised before applying its existing
  new-product tag filter.
- Floating WhatsApp now has a CSS-only trust nudge: size-help tooltip, soft
  gold pulse, small trust dot, and slow floating motion while preserving the
  existing href/target/fallback behavior and reduced-motion handling.
- PDP variant selection now syncs from URL option params, Add to Cart continues
  to submit the selected Shopify variant ID, the existing carousel prioritizes
  `selectedVariant.image`, and bag lines show the full selected option values
  while continuing to use `line.merchandise.image`.

## In Progress

- None. PDP deferred discount stability is verified on
  `codex/premium-discount-experience`.

## Pending

- Local Shopify Admin order lookup returned `401`; validate the production
  Oxygen token has `read_orders` (and `read_all_orders` for older orders).
- For the new discount ticket, the Shopify Admin token also needs
  `read_discounts`, and one intended public active code discount must match
  `DISCOUNT_TICKET_TAG` by tag, code, or title.
- Deploy `codex/order-tracking` to Oxygen Preview and visually verify the empty,
  loading, safe-error, pre-fulfillment, in-transit, exception, and delivered UI.
- Deploy `codex/premium-discount-experience` to Oxygen Preview and verify PDP
  ticket copy/apply, bag/cart ticket, sale-price display, cart savings, footer
  policy links, and `/refund-policy` redirect with a tagged test discount.
- Confirm restored imagery on deployed Home, About, and Gifting pages and tune
  the 520ms modal duration only if real-device capture still feels abrupt.
- Full preview browser/device QA.
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
- Luxury-phase `npm.cmd run codegen` - passed after trimming Quick View GraphQL.
- Luxury-phase `npm.cmd run lint` and clean TypeScript check - passed after the
  Quick View latency changes.
- Luxury-phase `npm.cmd run build` - client and Oxygen SSR bundles passed after
  the Quick View latency changes.
- Luxury-phase `npm.cmd run lint`, clean TypeScript, and `git diff --check` -
  passed after the adaptive motion/parallax changes.
- Luxury-phase `npm.cmd run build` - passed after adaptive motion/parallax;
  Lenis emitted as an on-demand 5.36KB-gzip client chunk.
- Luxury-phase codegen, lint, clean TypeScript, diff validation, and production
  build - passed after moving layout commerce behind user intent.
- Luxury-phase lint, clean TypeScript, and diff validation - passed after the
  mobile compositing and interaction-timing cleanup.
- Luxury-phase production client and Oxygen SSR build - passed after the mobile
  compositing and interaction-timing cleanup.
- Luxury-phase lint and clean TypeScript - passed after the generic public-route
  consistency implementation.
- Luxury-phase diff validation and production client/Oxygen SSR build - passed
  after the generic public-route consistency implementation; the shared
  `EditorialHeader` client chunk is 0.43KB gzip.
- A second `npm.cmd run preview -- --port 3000` production build passed, but
  MiniOxygen's Workers runtime could not start in the Windows sandbox, so no
  fresh rendered-HTTP session was available for the final generic-route pass.
- The in-app browser bootstrap also failed because Windows denied its sandbox
  process. These are local QA-environment limitations; compile, codegen, lint,
  TypeScript, and both production bundles passed.
- `git diff d145425..5e2e66a` protected-file audit passed, WhatsApp behavior was
  preserved, `.env` remained ignored, and the implementation worktree was clean.
- Regression follow-up lint, clean TypeScript, and `git diff --check` passed
  after the parallax, product-card, and modal-motion corrections.
- Regression follow-up production client and Oxygen SSR build passed;
  `ProductCard` decreased to 3.39KB gzip and `ParallaxImage` remained 0.92KB.
- Static follow-up audit confirmed no change to order-detail/Admin, feedback
  network/storage semantics, cart/bag, SEO, sitemap/robots, WhatsApp behavior,
  or `.env` tracking.
- Screenshot-reported regression fix committed and pushed as `1f6f2c7`.
- Official Shiprocket published Postman collection confirmed AWB endpoint
  `/v1/external/courier/track/awb/{awb_code}`.
- Configured Shiprocket authentication and a fake-AWB read-only request passed;
  the live endpoint returned the documented `tracking_data` error shape with
  HTTP 200 and `track_status: 0`, which the adapter treats as not found.
- Read-only local Shopify tracking-query validation returned HTTP 401, so no
  customer/order data was read and production Admin-token scope remains pending.
- Shopify's official current Admin GraphQL documentation confirmed the queried
  Order/Fulfillment fields and the `name`/`confirmation_number` search filters.
- Full Hydrogen codegen, lint, clean TypeScript, diff validation, and production
  client/Oxygen build passed. The isolated tracking route is 4.32KB gzip and the
  server-only provider module/credential names are absent from client assets.
- Direct fake-AWB execution through the new service returned the intended safe
  `NOT_FOUND`/404 contract; no raw Shiprocket response reached the route DTO.
- In-app visual browser setup and the local Workers runtime remain blocked by
  the Windows sandbox, so interactive layout QA remains a deployment-preview
  task rather than a claimed local pass.
- Luxury real-time `/track-order` route, footer link, environment guidance, and
  server normalization were committed and pushed as `c8f7050`.
- Premium discount phase `npm.cmd run codegen` - passed after adding
  `/refund-policy` route and Admin-backed discount ticket data.
- Premium discount phase `npm.cmd run lint` - passed after fixing the
  clipboard handler.
- Premium discount phase clean TypeScript
  `node_modules/.bin/tsc.cmd --noEmit --incremental false` - passed after
  widening money/cart helper types.
- Premium discount phase `git diff --check` - passed.
- Premium discount phase `npm.cmd run build` - production client and Oxygen SSR
  bundles passed.
- Client bundle scan found no `PRIVATE_SHOPIFY_ADMIN_API_TOKEN`,
  `X-Shopify-Access-Token`, `admin/api/2026-04`, `discountNodes`, or
  `DISCOUNT_TICKET_TAG` strings in `dist/client`.
- Protected-file audit showed no diff to order-detail/Admin route, feedback API,
  WhatsApp, checkout redirect, cart mutation helpers, cart pricing/line helpers,
  robots, or sitemap routes. `.env` remains ignored by `.gitignore`.
- Sold-out merchandising phase `npm.cmd run codegen` - passed after adding
  product-level availability to homepage, PDP recommendation, and all-products
  queries.
- Sold-out merchandising phase `npm.cmd run lint`, clean TypeScript, and
  `git diff --check` - passed.
- Sold-out merchandising phase `npm.cmd run build` - production client and
  Oxygen SSR bundles passed; the new shared availability helper emitted as a
  0.25KB gzip client chunk.
- Sold-out merchandising protected-file audit showed no diff to order-detail/
  Admin, feedback API, WhatsApp, sitemap/robots, or `.env`.
- WhatsApp trust nudge `npm.cmd run lint` - first parallel run timed out at
  120s, rerun alone passed.
- WhatsApp trust nudge clean TypeScript and `git diff --check` - passed.
- WhatsApp trust nudge `npm.cmd run build` - production client and Oxygen SSR
  bundles passed.
- WhatsApp trust nudge protected-file audit showed no diff to order-detail/
  Admin, feedback API, sitemap/robots, or `.env`; only the intended WhatsApp
  component, stylesheet, and handoff changed.
- WhatsApp rotating-tooltip follow-up `npm.cmd run lint`, clean TypeScript, and
  `git diff --check` - passed.
- WhatsApp rotating-tooltip follow-up `npm.cmd run build` - production client
  and Oxygen SSR bundles passed.
- WhatsApp rotating-tooltip follow-up protected-file audit showed no diff to
  order-detail/Admin, feedback API, sitemap/robots, or `.env`.
- Variant image handling `npm.cmd run lint`, clean TypeScript, and
  `git diff --check` - passed after memoizing PDP variants to satisfy React hook
  dependency lint.
- Variant image handling `npm.cmd run build` - production client and Oxygen SSR
  bundles passed.
- Variant image handling protected-file audit showed no diff to order-detail/
  Admin, feedback API, WhatsApp, checkout route, sitemap/robots, or `.env`.
- PDP product-description follow-up started from `codex/premium-discount-experience`:
  the existing product notes section is being reshaped into a clearer
  "Product description" area that surfaces product description, selected color,
  available colors/sizes, fabric, fit/audience, occasion, shade note,
  transparency, care, craft, gifting, shipping, reviews, and any additional
  explicitly fetched non-image product metafields.
- PDP product-description follow-up refined: the section now uses a left-side
  specs table only for available `embroidery`, `length`, `fabric`, `fit`, and
  `neckline` values, while the right side is limited to description, shade note,
  wash care, and a review-wall link.
- Anchor/sale pricing follow-up started: shared compare-at pricing now presents
  clearer sale copy (`Limited atelier price`, exact save amount, and percent
  off), while bag page, bag lines, and cart drawer surface total/line savings
  against original piece prices.

## Next Step

Deploy `codex/premium-discount-experience` to Oxygen Preview. In Shopify Admin,
grant the private Admin token `read_discounts`, then set `DISCOUNT_TICKET_TAG`
to the intended public active code discount's tag, code, or title, and verify
the ticket/sale/refund UI on a real PDP and bag.
Continue to avoid using another customer's order data while order tracking token
setup remains pending.
