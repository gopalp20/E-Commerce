# FORME

Everyday objects, thoughtfully chosen.

FORME is a college-demo marketplace for living, working and daily rituals. The first release is a complete cash-on-delivery shopping journey with real PostgreSQL persistence. There is no live payment provider or real fulfilment service.

## Identity

The wordmark uses close-set uppercase type and a small cobalt punctuation mark. The F mark is drawn as simple editable SVG geometry and stays legible at favicon size. The visual direction closely follows the concrete, cobalt metalwork and burnt-orange accents of Cemnt Café in Jubilee Hills, as requested. Flat stone surfaces, stronger blue typography and terracotta details carry that material palette into the store. FORME retains its wordmark and product photography. The colours below are our implementation palette, not sampled official brand values.

- Paper: #edede9; concrete: #d6d8d1; ink: #242623; cobalt: #234bd2; terracotta: #b94d2c.
- Muted text: #555b55; orange text: #973c22. Text uses darker variants for legibility on concrete.
- Public landing: framed concrete hero, cobalt display type, terracotta image caption and cobalt footer. Signed-in shopping retains its compact layout, with an open welcome header aligned to the category section and a compact footer. The welcome area shares the page background, with no filled panel or blue top stripe.
- Shared actions and selections use cobalt; operational success, warning and error states keep their semantic colours. Search focus uses a dark border, without an outer blue ring.
- Visual reference: https://www.siasat.com/inside-cemnt-cafe-hyderabads-first-brutalist-cafe-goes-viral-3496173/
- Typography: DM Sans for controls/body and Manrope for display. Both variable fonts are bundled locally through Fontsource; system sans fallbacks remain available.
- Thin concrete rules, restrained 2–4px corners, generous outer margins, 44px primary touch controls.
- Prices use tabular numerals and one shared INR formatter.
- Motion explains state changes; reduced-motion disables decorative movement.
- No fabricated ratings, discounts, category counts, delivery guarantees or subscriptions.

## First release

Public landing → public catalogue/search/filter → product → Add to bag → sign in/register when needed → customer shopping home with the selected item in the bag → checkout → saved/new delivery address → delivery method → pay on delivery → saved order → order history/cancellation.

Signed-in customers use `/shop` as home. The header has Shop, Orders, search, the customer name/account menu and bag. The account footer is compact. Categories are API data, presented as tiles on the shopping home and a sidebar (custom selector on mobile) in the catalogue. Admin category changes need no frontend code changes.

Radix Select and Dropdown Menu provide keyboard/focus behaviour beneath FORME styling. Toasts appear at the top centre. The address book supports labelled addresses, one default per customer, editing and removal. Checkout can reuse a saved address or save a new one atomically with the order.

The backend owns stock, current price and delivery totals. Checkout accepts an idempotency key. Order lines and addresses are saved as snapshots. Cancellation restores stock only once. A separate local PostgreSQL cluster avoids using the previously exposed shared credentials.

## Management workspaces

Admin and vendor pages share the storefront's paper, ink, Manrope and DM Sans identity. A cobalt navigation rail with white type, an underlined current page and neutral table rules carries the same palette into operational screens. Mobile navigation uses the same blue surface. Metrics and charts use cobalt, and calls for attention use a pale terracotta surface. Metrics sit in one strip; overview content prioritises orders and inventory. Product photography appears in listings. Marketing heroes and the large public footer are absent.

Admin navigation: Overview, Orders, Products, Reviews, Categories, People, Vendor requests and Reports. Vendor navigation: Overview, Orders, Products, Reviews and Your studio. Product creation belongs to the Products page action. Forms open in right-hand drawers or a dedicated product editor. Mobile uses a dismissible menu and preserves essential product details below its name. Category links are database data, not navigation constants.

Reports use actual orders, exclude cancellations from value calculations, and describe order value separately from collected payments. There are no fabricated growth percentages. Draft and archived visibility survives stock edits; mixed-vendor orders explain administrator-only fulfilment before offering an action.

## Scope boundaries

Seller-specific fulfilment, card-provider payments, refunds and email delivery remain later milestones. Vendor photo uploads, image ordering, alternative text and customer product galleries are implemented using local media storage. Do not present the future payment, refund, email or courier workflows as completed actions.

## Visual QA

Check the homepage, catalogue, product, cart, authentication, checkout, order confirmation, account, admin categories/people/reports and seller products/orders at desktop and mobile widths. Test keyboard navigation, visible focus, slow/error/empty/loading states, text contrast, image loading and reduced motion. Test order persistence after reloading and signing in again.

## Reviews, photography and motion

Reviews use an open two-column layout: rating summary and distribution alongside readable customer feedback. Terracotta stars, thin rules and the existing custom selectors carry the store's identity. Reviews have no fabricated counts or decorative quote cards. The mobile layout stacks the summary above the list. Native radio inputs provide keyboard operation beneath the star controls.

The photo viewer uses the full screen with an unobstructed image area, a fixed close control, small thumbnail strip and grouped zoom controls. Zoom anchors to the pointer, panning stops at image edges and Fit always recenters. Navigation arrows keep stable hit targets on press. Loading and failed-image states are explicit.

Page content enters in 220ms with a 5px translation, while navigation remains mounted. Drawers use 180ms transitions and preserve closing content; menus exit in 120ms. Loading indicators wait briefly to avoid a flash for fast responses. Product filter updates retain existing results during refresh. Reduced-motion preferences disable these decorative transitions.
