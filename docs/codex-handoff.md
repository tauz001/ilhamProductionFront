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
- PDP style add-ons follow-up started: product pages now read optional
  product-reference metafields for `custom.style_with_plazo` and
  `custom.style_with_dupatta`, hide the section for sets/full outfits via
  `custom.disable_style_addons` plus title/type/tag safeguards, and render a
  compact "Style it with" add-on area below Add to bag. Product cards now expose
  compare-at sale pricing more visibly with a bottom-right image `% off` badge,
  and homepage/collection/quick-view/gifting queries fetch compare-at prices.
- PDP style add-ons/sale badge verification: `npm.cmd run lint`,
  `npm.cmd run typecheck`, `git diff --check`, and
  `npm.cmd run build` all passed after codegen refreshed
  `storefrontapi.generated.d.ts`.
- PDP above-the-fold purchase follow-up started: product media height was reduced
  on mobile, thumbnail rail is hidden on mobile in favor of dots, the desktop
  buy box spacing/title/options/actions were tightened, size help moved below
  the main purchase action, add-on cards were compacted, and a mobile fixed
  purchase dock now keeps Add to bag plus add-on chips visible immediately.
- PDP above-the-fold purchase verification: `npm.cmd run lint`,
  `npm.cmd run typecheck`, `git diff --check`, and
  `npm.cmd run build` all passed.
- Product-as-colour-listing follow-up started: PDP now reads
  `custom.connected_colour_products` or `custom.connected_color_products`
  product-reference metafields and renders linked colours as separate product
  URLs while keeping size selection on the current product. When connected
  colour products exist, the legacy variant `Color`/`Colour` option is hidden
  so customers do not see duplicate colour controls.
- Product-as-colour-listing implementation details: added
  `app/components/commerce/ProductColourLinks.tsx`, updated the product route
  GraphQL to fetch linked colour products plus `display_colour`/`display_color`,
  `colour`/`color`, and `colour_hex`/`color_hex`, and refreshed
  `storefrontapi.generated.d.ts` through Hydrogen codegen.
- Product-as-colour-listing verification: `npm.cmd run lint`,
  `npm.cmd run typecheck`, and `npm.cmd run build` all passed. The first build
  exposed a GraphQL metafield argument conflict, fixed by aliasing linked-colour
  metafields as `colourMetafields`.
- Hybrid colour-listing follow-up started: the existing separate-product model
  remains unchanged, and products explicitly enabled with
  `custom.split_colour_listings = true` now expand only their Color/Colour
  option values into storefront listing cards. Each virtual card uses the
  option value's `firstSelectableVariant` image, price, compare-at price, and
  selected colour URL while preserving the real Shopify product and variant.
- Hybrid colour listings are applied to homepage product rails, collection
  grids and filters, `/collections/all`, regular search results, and PDP
  recommendations. Their CTA opens the colour-selected PDP to choose size;
  virtual cards never add an arbitrary size directly and never alter cart or
  checkout data.
- Hybrid precedence is deterministic: a non-empty
  `custom.connected_colour_products` or `custom.connected_color_products`
  disables virtual splitting for that product, so true separate colour
  products cannot be duplicated. Optional `custom.base_title` controls the
  shared title before the automatic ` - Colour` suffix. No environment
  variables or Admin API scopes are required.
- Hybrid colour-listing verification passed: `npm.cmd run codegen`,
  `npm.cmd run lint`, `npm.cmd run typecheck`, `git diff --check`, and
  `npm.cmd run build`. The optimized `ProductOptionValue.firstSelectableVariant`
  queries passed Shopify Storefront schema generation, and the new shared
  client chunk is approximately 1.00KB gzip.
- Interactive local smoke testing was attempted after the production build,
  but the installed in-app browser plugin is missing its required
  `scripts/browser-client.mjs`; no visual pass is claimed. The temporary local
  Hydrogen server was stopped. Real split-card acceptance still requires the
  Shopify boolean metafield to be created and enabled on a test product.
- Live Storefront colour-image audit completed on 2026-07-14. The hybrid code
  is resolving the selected colour and `firstSelectableVariant.image`
  correctly. For `nazakat-hand-embroidered-long-spaghetti`, Shopify currently
  returns the same featured image for White, Pink, Mint Green, and Blue, so
  neither the virtual listing cards nor PDP can display distinct colour
  imagery. By contrast, `naaz-long-hand-embroidered-chikankari-kurti` returns
  distinct variant images for Purple, Navy, Beige, Sea Green, Teal, and Maroon,
  confirming the storefront image-selection path works. No code change is
  required for this symptom; assign the correct image to every size/fabric
  variant of each colour in Shopify Admin.
- Colour-gallery grouping follow-up started: added the shared
  `app/lib/commerce/colour-media.ts` parser for the Shopify image-alt convention
  `Colour | View` (for example `White | Front`). On PDP, once the selected
  colour has at least one matching labelled image, the carousel shows only that
  colour's labelled media and orders `Front` first; a colour with no matching
  labels retains the existing gallery as a compatibility fallback. Virtual
  split-colour cards reuse matching labelled media when it is already present
  in their lightweight card query, otherwise they retain the assigned Shopify
  variant image. PDP now requests metadata for up to 50 product images so
  multi-colour galleries can be grouped; browser image loading remains limited
  to the visible carousel through the existing responsive/lazy image behavior.
- Colour-gallery verification passed: `npm.cmd run codegen`, full-tree
  `npm.cmd run lint`, `npm.cmd run typecheck`, `git diff --check`, and the
  production client/Oxygen SSR `npm.cmd run build` all passed. A local SSR
  request for `nazakat-hand-embroidered-long-spaghetti` with White selected and
  the currently labelled `White | Front` media rendered that image as the main
  image with no other-colour thumbnails or carousel controls, confirming the
  opt-in filtering path. The temporary local Hydrogen server was stopped.
- Unified PDP colour swatches started: normal Shopify Color/Colour variant
  buttons now request `ProductOptionValue.swatch` and render its configured
  colour or swatch image beside the option label. Linked separate-colour
  products reuse the same compact swatch component with
  `custom.colour_hex`/`custom.color_hex`, and missing swatch data falls back to
  a neutral branded treatment rather than guessing a potentially incorrect
  colour. Size, fabric, selection, availability, URL, cart, and checkout
  behavior remain unchanged.
- Unified PDP colour-swatch verification passed: `npm.cmd run codegen`,
  full-tree `npm.cmd run lint`, `npm.cmd run typecheck`, `git diff --check`, and
  `npm.cmd run build` all passed. A read-only live Storefront query confirmed
  that `nazakat-hand-embroidered-long-spaghetti` returns exact Shopify swatches
  for White, Pink, Mint Green, and Blue. Local SSR then rendered all four exact
  swatch colours beside their labels. The temporary Hydrogen server was
  stopped, and the protected order, feedback, WhatsApp, cart, checkout,
  sitemap, robots, and Admin API surfaces have no diff.

## Shopify-Controlled Homepage Campaign Phase

### Approved Objective

- Add two fixed homepage campaign slots without turning the Hydrogen homepage
  into a general-purpose page builder.
- Each Shopify-managed slot can show a short full-width responsive banner, a
  product rail fetched by Shopify product tag, both together, or nothing.
- Control visibility with metaobject booleans plus optional start/end dates so
  campaigns can be prepared, activated, expired, or removed without code or a
  new deployment.
- Reuse the existing `ProductRail` and `ProductCard` so sale pricing, linked or
  virtual colour listings, sold-out behavior, hover images, quick view, and
  product navigation remain consistent.
- Keep missing definitions/entries/configuration completely hidden and preserve
  the existing homepage when Shopify setup is absent.
- Keep Storefront reads cached and bounded, load only enabled rail products,
  use responsive Shopify CDN banner images, and preserve all protected order,
  feedback, WhatsApp, cart, checkout, sitemap, robots, and Admin API behavior.

### Implementation Order

1. Define and normalize the `homepage_campaign` Storefront metaobject contract
   for fixed handles `slot-1` and `slot-2`.
2. Query active/scheduled configuration safely, then fetch at most the configured
   number of products for each enabled tag-driven rail.
3. Add a shared responsive campaign surface and place slot 1 after the homepage
   marquee and slot 2 between the Women/Men edit and Wedding edit.
4. Verify missing, disabled, banner-only, rail-only, combined, scheduled,
   malformed, mobile-image, internal-link, external-link, and empty-tag cases.
5. Run codegen, lint, TypeScript, diff checks, production build, and protected
   surface audit; update this handoff, commit, and push the checkpoint.

### Current Notes

- Implemented the server-only `homepage_campaign` reader for fixed entry
  handles `slot-1` and `slot-2`. Missing definition/scope/entries, query errors,
  disabled entries, Draft entries, invalid schedules, and incomplete content all
  fail closed without changing the existing homepage.
- Each active entry supports banner-only, rail-only, or combined output through
  `enabled`, `show_banner`, and `show_rail`. Optional `start_at` and `end_at`
  provide server-enforced scheduling. Banner links are limited to safe internal
  paths or HTTP(S) URLs.
- Campaign rail products are selected by exact Shopify tag, sorted by the
  configured newest/best-selling/price/title mode, capped to 2-12 products, and
  moved sold-out-last while retaining Shopify's chosen order among available
  products. Product queries run only for currently enabled/scheduled rails with
  a non-empty tag.
- Added a responsive full-width campaign banner with desktop/mobile Shopify CDN
  sources, fixed responsive height, lazy decoding/loading, optional real HTML
  copy/CTA, light/dark text treatment, and a restrained hover scale. Rails reuse
  the existing `ProductRail`/`ProductCard` commerce path.
- Fixed placements are implemented: slot 1 follows the hero heritage marquee;
  slot 2 follows the Women/Men edit and precedes the Wedding edit.
- Added `docs/shopify-homepage-campaigns.md` with the exact definition, field
  keys/types, entry handles, operating modes, scheduling, tagging, and safety
  behavior required for Shopify Admin setup.
- `npm.cmd run codegen`, full-tree `npm.cmd run lint`, and
  `npm.cmd run typecheck` passed. Production client/Oxygen SSR build passed; the
  homepage route remains 5.73KB gzip and no campaign query/config identifiers
  appear in client JavaScript.
- Local zero-setup SSR acceptance returned HTTP 200 with the existing hero, New
  Arrivals, and Best Sellers intact, zero campaign wrappers, and no empty slot
  spacing. The temporary Hydrogen server was stopped.
- Protected order-detail/Admin, feedback, WhatsApp, cart, checkout, sitemap,
  and robots surfaces have no diff. `.env` remains ignored and unchanged.
- Live production campaign audit on 2026-07-17 confirmed the deployed homepage
  JavaScript contains the campaign implementation, Oxygen returns HTTP 200,
  Storefront API can read the Active `homepage_campaign` entry at `slot-1`,
  both banner images resolve, and the exact `new arrival` tag currently matches
  ten products. The configured slot is hidden only because `end_at`
  (`2026-07-16T21:30:00Z`) occurs before `start_at`
  (`2026-07-17T09:00:00Z`); the schedule intentionally fails closed.
- The same audit found three non-blocking configuration corrections:
  `banner_link`/`rail_link` need `/` or a complete `https://` URL,
  `text_theme` should be `light` or `dark`, and `product_limit` values above 12
  are safely clamped to 12. `slot-2` does not exist yet, which is valid and
  simply leaves the second fixed position empty.
- Homepage rhythm refinement completed after live campaign acceptance. A
  combined banner-and-rail campaign now uses only 36px/44px top padding before
  the rail instead of the previous 80px/96px, with a tighter heading gap and a
  slightly more generous bottom edge so the offer reads as one unit without
  colliding with the following story.
- The homepage editorial cadence is denser without flattening its hierarchy:
  the House of Whitework statement now uses 80px/112px vertical padding, New
  Arrivals and Best Sellers use compact 80px/96px spacing, Women/Men cards are
  62svh/68svh instead of 80vh, and the Wedding edit is 68svh/78svh instead of
  a full viewport. A lightweight four-column `The ilham promise` strip now
  bridges Wedding into Best Sellers with links to About, Shipping, and Refund
  policy pages.
- Decorative Urdu calligraphy was removed completely for now from homepage,
  bag/empty bag, search drawer, mobile navigation, footer, login, and signup.
  The unused `UrduCalligraphy` component and `font-urdu` utilities were removed;
  commerce behavior and customer-account flows were not changed.
- Rhythm refinement verification passed full-tree `npm.cmd run lint`,
  `npm.cmd run typecheck`, `git diff --check`, and the production client/Oxygen
  SSR `npm.cmd run build`. Local SSR using the real Active Shopify campaign
  returned HTTP 200 with `slot-1`, its rail, and `The ilham promise` present,
  and no Urdu component/class output. The temporary server was stopped.

## Homepage Commerce Storytelling Phase

### Approved Objective

- Add a compact, traditionally styled category section without using the
  generic "Shop by categories" heading.
- Make Shopify campaign banners and their optional product rails feel like one
  continuous offer while retaining the existing campaign configuration.
- Add a dynamic New Arrivals story before the existing rail, populated from
  the newest Shopify products and linked to the real New Arrivals collection.
- Reduce excess homepage section height without shrinking or replacing the
  shared `ProductCard` component.
- Shorten the House of Whitework story and upgrade the Ilham promise into a
  useful icon-led trust strip with short supporting descriptions.

### Current Notes

- Added `HomepageEditorial.tsx` with three bounded, data-driven surfaces:
  `NewestAtelierEdit`, `HomepageCategoryEdit`, and `HomepagePromiseStrip`.
- `NewestAtelierEdit` automatically uses the first three newest products that
  have images. Desktop presents them in restrained Lucknow-arch frames beside
  the editorial CTA; mobile becomes a horizontal arch trail. The existing New
  Arrivals `ProductRail` begins immediately below in the same section, reusing
  the existing full-size ProductCards and linking to `/collections/new-arrivals`.
- Replaced the tall Women/Men split with `The Courtyard Edit`: four compact
  traditional arches for Women, Men, Wedding, and Gifting. Each uses its real
  collection URL and collection image when available, with existing editorial
  imagery as a safe fallback because the current Shopify collections do not
  yet have collection images.
- Combined campaign banners now overlap their rail heading panel slightly;
  rail title, subtitle, and card spacing were tightened so the banner and rail
  read as one offer. Banner-only and rail-only behavior remains unchanged.
- House of Whitework, standalone homepage rail wrappers, and heading gaps are
  shorter. ProductCard image/card dimensions were not changed.
- The Ilham promise now has four lightweight Lucide icons, concise headings,
  one-line explanations, real About/Shipping/Refund links, and deliberate top
  breathing room after the Wedding edit.
- Desktop visual QA at 1440x1000 confirmed the campaign overlap, arched New
  Arrivals composition, four-column Courtyard Edit, promise strip, and no
  horizontal overflow. Mobile visual QA at 390x844 confirmed the New Arrivals
  arch trail, two-column Courtyard Edit, stacked promise cards, and no document
  overflow. Product cards retained their existing dimensions in both views.
- No Shopify definition, environment variable, Admin API scope, or manual
  product assignment is required for this phase. New Arrivals update whenever
  the existing newest-product Storefront data updates; campaign controls remain
  in the existing `homepage_campaign` metaobjects.
- Final verification passed full-tree `npm.cmd run lint`, `npm.cmd run
  typecheck`, `git diff --check`, and the production client/Oxygen SSR
  `npm.cmd run build`. The generated homepage route is 7.54KB gzip. The diff is
  limited to the homepage route, its campaign/editorial components, and this
  handoff; protected order, feedback, WhatsApp, cart, checkout, sitemap, robots,
  and Admin API files remain untouched.

## Automatic Shopify Admin Token Phase

### Problem Confirmed

- Shopify Dev Dashboard client-credentials access tokens expire after roughly
  24 hours by design.
- The storefront previously stored one generated `shpat_...` value in
  `PRIVATE_SHOPIFY_ADMIN_API_TOKEN` and reused it indefinitely.
- Storefront API features such as products and homepage campaigns continued to
  work because they use separate Storefront credentials, while Admin-backed
  features such as ilham's wall failed safely after the Admin token expired.

### Implementation

- Added the server-only shared Admin client
  `app/lib/commerce/shopify-admin.server.ts`.
- The client requests a fresh Admin token with the Shopify client-credentials
  grant, caches it until five minutes before expiry, and deduplicates concurrent
  token exchanges inside an Oxygen worker.
- Admin GraphQL requests retry exactly once with a forced refresh after HTTP
  401. Tokens, Client IDs, and secrets are never logged or returned to browser
  code.
- Ilham's wall, wall invite/photo writes, discount-ticket reads, order-feedback
  persistence, and public order tracking now use the shared client.
- The existing `PRIVATE_SHOPIFY_ADMIN_API_TOKEN` remains a legacy fallback so
  current deployments fail gracefully while the new variables are being added.
- The protected account order-detail Admin enrichment file was intentionally
  not changed.

### Required Environment

- Add these server-only values locally and in Oxygen:
  - `PRIVATE_SHOPIFY_ADMIN_CLIENT_ID`
  - `PRIVATE_SHOPIFY_ADMIN_CLIENT_SECRET`
- Keep `PUBLIC_STORE_DOMAIN` set to the exact `.myshopify.com` store domain.
- The released app version still needs the scopes required by each feature:
  `read_orders`, `write_orders`, `read_metaobjects`, `write_metaobjects`,
  `read_files`, `write_files`, and `read_discounts`; older order searches may
  also need Shopify approval for `read_all_orders`.
- Do not place the Client Secret in a `PUBLIC_` variable or commit `.env`.

### Verification

- Shared token helper mock passed: cached tokens were reused, and a simulated
  401 performed one refresh and one retry.
- `npm.cmd run lint` passed.
- `npm.cmd run typecheck` passed.
- `npm.cmd run build` passed for both client and Oxygen SSR bundles.
- Client bundle scan found no Admin environment names, token-exchange endpoint,
  or `X-Shopify-Access-Token` code.
- `git diff --check` passed.
- Local `.env` variable-name audit confirmed the two new client-credential
  variables are not configured yet; live Admin verification must follow after
  the owner adds them.

## Next Step

### Homepage Category And Rail Correction

- Preserve the dynamic arched New Arrivals feature and the improved Ilham
  promise, but remove `The Courtyard Edit`; restore the former full-width
  Women/Men editorial split in that position.
- Add a shorter, traditional category discovery strip immediately after the
  hero marquee. It must be controlled by a Shopify navigation menu named
  `homepage-categories`, use linked collection imagery (falling back to the
  collection's first product image), and hide cleanly when no valid category
  items exist.
- Treat Shopify Product Type as the storefront `Category` facet so setting a
  product's type in Shopify automatically adds it to the relevant collection
  filter values. Keep existing price, colour, occasion, fabric, size, and
  availability behavior unchanged.
- For campaign slots that contain both a banner and product rail, preserve the
  clean original campaign presentation, hide redundant rail title/subtitle
  copy, and place the product cards directly beneath the banner. Rail-only
  campaigns retain their visible heading and CTA.
- Remove the separate bottom arrow row from every shared `ProductRail`; place
  accessible left/right controls over the far rail edges on desktop and mobile
  so card dimensions remain unchanged and no empty control space remains.
- Implementation completed locally: the homepage now queries collection links
  from `homepage-categories`, renders up to seven circular category medallions
  immediately after the marquee, and falls back from collection image to the
  collection's first product image. Invalid/non-collection items fail closed.
- `The Courtyard Edit` was removed from the rendered homepage and the former
  Women/Men full-width split restored. The arched newest-product feature and
  Ilham promise remain unchanged.
- Combined campaign slots now hide redundant rail title/subtitle/CTA and place
  the unchanged ProductRail 8px/12px below the banner. Rail-only campaigns keep
  their full heading presentation.
- Shared ProductRail controls now overlay the left/right rail edges on desktop
  and mobile; the old bottom control row and its extra height are removed.
- Collection Product Type values now populate a `Category` filter on desktop
  and mobile, using the `category` URL parameter alongside all existing facets.
  The control hides when no Product Type values exist and appears automatically
  once Shopify category data is populated, avoiding an empty filter menu.
  Exact Shopify setup is documented in
  `docs/shopify-homepage-categories.md`.
- Browser QA passed at 1440x1000 and 390x844: the former Women/Men editorial
  split is restored, `The Courtyard Edit` is absent, ProductRail arrows overlay
  the far edges without document overflow, the old bottom control gap is gone,
  and desktop/mobile collection filters render cleanly. Because the
  `homepage-categories` menu is not present in the connected store yet, the new
  category strip correctly hides with no blank space; follow the Shopify guide
  below to activate it.
- Final verification passed Storefront codegen, full-tree `npm.cmd run lint`,
  `npm.cmd run typecheck`, `npm.cmd run build`, and `git diff --check`. The
  generated homepage route is 7.83KB gzip. The build only reports the existing
  empty server-route chunks and third-party Framer Motion sourcemap warnings.
  The diff is limited to homepage/rail components, collection filter plumbing,
  generated Storefront types, the Shopify setup guide, and this handoff;
  protected order detail, Admin API, feedback, WhatsApp, cart, checkout,
  sitemap, and robots files remain untouched.

Commit and push the verified homepage commerce storytelling checkpoint, then
deploy and confirm the production homepage on one phone and one desktop.
Shopify collection images are optional; adding them later to Women, Men,
Wedding, and Gifting will replace the current safe fallback images without a
code change.

After campaign acceptance, continue the existing colour-gallery checks below.

Deploy the verified colour-gallery and unified PDP swatch checkpoint. Visually
confirm one normal Shopify variant product and one connected separate-colour
product show a small colour circle beside every colour label while Size and
Fabric remain text-only.

Then label all media on
`nazakat-hand-embroidered-long-spaghetti` consistently: `White |
Front`, `White | Back`, and so on for Pink, Mint Green, and Blue. Assign each
colour's Front image to every matching size/fabric variant for cart and checkout
thumbnails. Confirm PDP colour changes replace the complete carousel group,
size changes retain that group, and virtual listing cards retain their correct
primary colour image.

Also retain the already-supported true separate-product test: create one
product per colour, connect siblings through the product-list reference
`custom.connected_colour_products`, and fill optional
`custom.display_colour` plus `custom.colour_hex`. Connected products must show
PDP colour links and must not be expanded as virtual variant cards.

After both models pass, deploy `codex/premium-discount-experience` to Oxygen
Preview/Production. No new environment variable or Admin API token is required
for either colour model.

Also, in Shopify Admin, grant the private Admin token `read_discounts`, then set
`DISCOUNT_TICKET_TAG` to the intended public active code discount's tag, code,
or title, and verify the ticket/sale/refund UI on a real PDP and bag.
Continue to avoid using another customer's order data while order tracking token
setup remains pending.
