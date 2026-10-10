# FORME — verification

## Submission-readiness pass - 10 October 2026

**Latest result: 60 automated tests pass; production frontend build passes; lint has zero errors and 22 warnings; whitespace/format checks pass.** Counts: 3 launcher configuration tests, 4 backend status tests, 47 API/PostgreSQL integration tests and 6 frontend geometry/report tests. Both the live checkout and a newly installed temporary source copy passed the full suite and build. The copy was installed using `npm run setup` with no existing node_modules, environment file or database.

The source copy used its own PostgreSQL cluster on 55433, API 5052 and web 5175. Its clean seed contained 4 demo users, 4 categories, 6 products and no invented orders/reviews. The browser walkthrough created one labelled sample order/review in that temporary copy only. All previous isolated QA and main store databases remained separate.

### What changed in this final pass

| Before | After |
| --- | --- |
| Browser-loaded Google fonts could change the demo appearance offline | Pinned Fontsource variable fonts served with local app assets; font loading and absence of external styles verified |
| Password fields had no visibility control | Accessible show/hide buttons on login/register, no accidental form submission; stable 44px-wide controls |
| Unexpected render failures could leave a blank screen | A branded error boundary with Reload and Back to store recovery; tested with an intentional crash fixture outside the submission source |
| Previous account's bag state could briefly remain visible | Bag rendering scoped to the current customer; stable auth cleanup callback and corrected effect dependencies |
| Local ports were fixed and readiness was reported too early | Validated optional ports, existing-data port protection, database URL guard before startup and web/proxied API readiness checks |
| Database/data-flow documents still described an older template | Current FORME architecture, 13-entity offline HTML reference, a presentation walkthrough and PDF report |
| Submission relied on a configured development folder | A source-only distribution excluding credentials, Git auth, runtime databases, dependencies and test fixtures |

### Fresh-install browser walkthrough

- Public home loaded six seeded products with no broken images, no horizontal overflow and locally loaded DM Sans/Manrope fonts.
- Guest Add to bag for Daybreak Cup & Saucer opened contextual login. Password show/hide changed input visibility without submitting. Customer sign-in added exactly one item.
- A saved sample address plus standard delivery created order FM-00001 for INR 1,039 (INR 890 + INR 149). Reload retained the order and address.
- The owning seller, Form & Field, advanced it through Confirmed, Shipped and Delivered. Customer order history and Review this item reflected delivery.
- Customer published a clearly labelled walkthrough review. Public rating became 5.0 from one verified review. Admin hid it with a reason; the product showed zero public reviews. Restoring returned it to Published. Filtering to the other vendor showed no borrowed feedback.
- The clean demo's console had no errors/warnings before the deliberate error-boundary fixture. That isolated fixture rendered the recovery page, and Back to store restored the existing customer session.
- Standard login measured exactly 1280 x 720 document/viewport on desktop and 390 x 844 on mobile, with no horizontal or vertical overflow. The password toggle measured 44 x 46px on mobile. Contextual login with extra pending-product details may legitimately scroll in a short viewport.
- A full stop/start preserved all compared user, stock/status, order/line, address and review records. Re-seeding created no duplicate products/users. The revised readiness probe produced a clean startup without transient proxy-error messages.
- Final main-store comparison confirmed unchanged product stock/status and unchanged user orders, with no QA review inserted. Main product and review APIs returned 200.

Screenshots: `screenshots/submission-customer-desktop.png`, `submission-admin-desktop.png`, `submission-login-desktop.png`, `submission-login-mobile.png`. Earlier sections below preserve the detailed feature, mobile, role, gallery, review, saved-item and motion evidence from previous passes.

The remaining 22 lint warnings concern synchronous state updates in effects, helpers/hooks exported with components, and a ref-cleanup diagnostic. They were not hidden by disabling rules. Physical touch hardware, Windows/Linux installation, other browser engines, external hosting and real payment/shipping services remain unverified/out of scope. The PDF is a technical project report and walkthrough, not a university-specific title-page/certificate template.

## Earlier end-to-end audit — 10 October 2026

This pass checks the original project handoff plus the saved-address, gallery, review and vendor-filter enhancements. Work continued in the existing `feature/forme-storefront` checkout at `1e5b21b`, preserving its uncommitted implementation. The older sections below record earlier passes and their then-current scope.

**Current checks: 57 automated tests passing, production build passing, no lint errors (27 existing warnings), and `git diff --check` passing.** The total comprises 4 backend unit tests, 47 API/database integration tests and 6 frontend calculation/geometry tests. Integration tests use `forme_test` and clean up only their fixtures. The browser audit uses a separate `forme_audit` database and local media directory at `http://127.0.0.1:5174`; the user's store remains at port 5173. Final database comparison confirmed that the user's product stock/status and orders match the pre-audit snapshot; no QA reviews were inserted there.

### Shopping basics follow-up — saved items and discovery

Research compared the live shopping flow with [Baymard's save-for-later guidance](https://baymard.com/guidelines/622-implementing-a-cart-save-for-later-feature), [essential sort types](https://baymard.com/research-articles/essential-sort-types), and [recognizable in-cart products](https://baymard.com/research-articles/highlight-products-if-in-users-cart). The implementation prioritizes returning to products and finding suitable items. FORME retains its requested account gate for bag actions; persistent saved items also require a customer account. This is a deliberate scope choice, not a claim to implement every research recommendation.

| Before | After |
| --- | --- |
| Customers could only keep products in their bag | Saved hearts on cards and product pages; private account list, mobile/account navigation, sign-in and registration handoff |
| Removing an item meant losing it | Atomic bag-to-saved transfer preserving quantity; safe move back; current stock/price checks and repeatable requests |
| Old saved-product state could mislead customers | Price-change notes, sold-out and withdrawn states, revalidation on entry/focus; old saves do not reveal private draft edits |
| Customers could add the same product without context | In-bag labels on cards and View bag on saved rows already in the bag |
| Discovery lacked stock/rating refinements | In-stock and minimum-rating filters with removable applied filters, URL persistence and empty-result recovery |
| Ratings and popularity could not order the catalogue | Highest-rated and best-selling sorts calculated before pagination, with deterministic ties; only published reviews and delivered units count |
| Paginated results could start near the bottom | Catalogue and saved-item page navigation returns to the top; saved lists use 12 items per page |

Automated coverage added 11 API/database integration cases: private account persistence and repeat login; concurrent saves/removals; atomic transfers and foreign-bag denial; concurrent move retries and existing-bag merges; changed prices/stock and later restock; withdrawn/private-product data; role, ownership, ID/body validation; 200-item capacity with rollback preserving the bag; combined rating/category/stock/price filters and paging; delivered-unit ranking and literal wildcard search; and the saved-item → bag → checkout → cancellation lifecycle. The latest full suite passes 57 tests (4 + 47 + 6). Production build passes, lint remains at 27 pre-existing warnings and no errors, and whitespace checks pass.

Browser evidence in `forme_audit`:

- Guest card heart → sign-in → Saved items; persisted after reload. Product-page save/unsave state follows the list.
- Bag quantity 2 → saved quantity 2 → bag, with correct header count and empty-bag recovery links.
- Seller changed QA product 17 from ₹1,290/5 units to ₹1,190/1 unit. Customer list displayed the price change, blocked quantity 2, and allowed an explicit decrease to 1. A demo order (FM-00004) recorded current prices and the correct ₹2,229 total; cancellation restored the one available unit. The QA product was restored to its previous ₹1,290/5-unit state afterward.
- Account switching from Alex to Audit Buyer showed the latter's empty list. The two customer lists did not mix.
- Rating + stock + category filters combined correctly, including an empty result; removing the category recovered results; reload retained filters. Highest rated and best selling put the reviewed/delivered cup first. Clear filters preserved sorting.
- Fourteen temporary saved items exercised 12 + 2 pagination and top-of-page reset. Temporary pagination saves were removed, retaining two representative QA saves.
- Saved items, catalogue filters and in-bag controls had no horizontal overflow at 320px; saved-list layout also checked at 390px and 1280px. Saved quantity controls were at least 40 × 44px; move controls at least 48px high. Mobile navigation reaches Saved items and dismisses properly.
- Testing caught a newly introduced account-menu slot error. Its duplicate child link was removed and desktop/mobile menu navigation was rechecked.

Evidence: `screenshots/saved-items-desktop.png`, `saved-items-mobile.png`, and `shopping-filters-mobile.png`. All mutation testing stayed in the isolated QA/test databases. The user's main product stock/status and orders still match the pre-audit snapshot; no QA reviews were inserted there. Only the additive SavedItem table migration was applied to the user's store.

This verifies the named flows in the local browser and PostgreSQL environments. It is not a physical-device/cross-browser certification or a guarantee of zero defects. Real online payment, shipping/refund integrations, variants/SKUs and seller-specific split fulfilment remain explicitly scoped in README.

### Original handoff coverage

| Area | Automated evidence | Browser evidence in isolated QA store |
| --- | --- | --- |
| Registration, login, roles | Password hashing, normalized email, invalid/expired authentication, current database role overriding stale JWT claims, authorization | Registered customer; signed in as customer, vendor and admin; role-specific home and sign-out |
| Catalogue | Active/sold-out visibility, name/description search, category/price filters, all sorts and pagination | Public browse, search, price filter, API-driven categories, desktop/mobile product detail |
| Cart | Add, merge, update, remove, clear, availability/quantity limits, concurrent adds | Guest Add gates login and preserves selection; quantities and totals; Clear bag confirmation and empty state |
| Checkout | Atomic stock/price checks, price snapshots, delivery totals, duplicate retry, competing purchases of final unit, rollback | Address entry/save, express delivery, order creation, persistence after reload |
| Customer orders | Ownership, allowed transitions, repeated/concurrent cancellation restoring stock once | Order list/detail, cancellation, delivered order and review entry point |
| Vendor onboarding | Apply, pending/duplicate rules, approval, safe response fields | Customer applied; admin approved; account appeared under Vendors; admin changed role back |
| Vendor inventory | Ownership, create/edit, drafts, sold-out stock, archive/restore and upload validation | Created two-photo product; edited alt text/cover/order/specification; draft → publish → archive → restore → publish; restocked sold-out item |
| Vendor orders | Seller ownership, single-vendor status transitions, mixed-vendor restrictions | Confirmed, shipped and delivered own order; mixed order explains admin fulfilment |
| Admin management | Statistics, category CRUD/conflicts, role changes, product management, order transitions | Created/renamed/deleted empty QA category; searched/filtered people; edited another seller's price; managed mixed order |
| Admin per-vendor filtering | Products and order query filters, invalid filters, access guards, mixed-order inclusion | Products, Orders and Reports filtered by vendor; edit/back and report-to-orders preserve selection |
| Address book | Ownership, CRUD, concurrent default changes, default promotion, checkout snapshot/idempotency | Saved, selected and edited an address; shipping snapshot remains unchanged |
| Product photos | Ordered persistence, cover sync, asset ownership, invalid/oversized/type-mismatched upload rejection | Real file chooser upload, thumbnails/arrows/Home, enlarged image, zoom, keyboard and focus return |

### Reviews and ratings

Implemented one review per customer/product after a delivered purchase. Customers choose 1–5 stars, write a title and body, edit/delete their review, and manage it under **Account → My reviews**. Delivered order items link to the product's review section. Public product cards/details show real rating aggregates; unrated products do not receive invented stars.

- Public review list: five-star distribution, rating filter, newest/helpful/highest/lowest ordering and server pagination. A rating filter changes the list count while the overall breakdown continues to represent every published review.
- Helpful voting is one vote per customer and idempotent; self-voting is rejected. Unauthenticated visitors are directed to sign-in and return to the same product's reviews. Customer display names omit email and use the last initial.
- Sellers have a read-only Reviews page scoped to their products. Administrators can filter by vendor/rating/visibility, hide with a required customer-visible reason, and restore. Hidden reviews are excluded from the list and all public rating aggregates. Editing a hidden review cannot publish it again.
- API tests cover delivery eligibility, pending/no-purchase denial, invalid content, duplicates, ownership, public-field minimization, concurrent duplicate votes, vote removal, edit/delete/cascade, aggregates, sort/filter/pagination, administrator authorization and moderation, vendor isolation, and archived products.
- Browser: Alex reviewed delivered order FM-00002's cup, edited 4 stars to 5 through My reviews, and another customer marked it helpful. The cancelled-order customer could not write a review. Rating filtering showed the correct empty state. Admin hid/restored the review and the public score changed to unrated and back. Vendor filtering isolated it to Form & Field, and that seller saw the feedback without moderation controls.
- Review photos/videos, seller replies and customer abuse-report workflows are not part of this version. Review text is rendered as text, not interpreted as HTML.

### Fixes and interface changes found during the audit

| Before | After |
| --- | --- |
| Cart API could clear the bag, but the page had no action | Themed Clear bag confirmation with busy/error handling and a useful empty state |
| Two simultaneous adds could lose one operation | Serializable cart update with a concurrent-add regression test |
| Vendor approval response included the stored password hash | Explicit safe user-field selection and a regression assertion |
| Admin product rows lacked an edit path | Shared product editor for administrators, including return to the selected vendor |
| Recent-order overview links ignored the selected order | Order detail drawer follows the `order` URL parameter |
| Page changes and refreshes replaced content abruptly | Persistent navigation shells, short content entrance, delayed loading indicators, retained filter results, stable refresh data, and drawer/menu transitions |
| Closing drawers could briefly flash reset form content | Closing content remains stable through the exit transition |
| Vendor data could not be isolated | Custom vendor selectors on Products, Orders, Reports and Reviews; backend query scoping |
| Vendor order/report totals could imply the entire mixed order belonged to one seller | Vendor line quantities/value use purchased unit-price snapshots; delivery and other vendors' items are excluded; full order remains visible to admin |
| Selected workspace navigation used a large white slab and accent stripe | Underlined white label on the existing cobalt rail |
| Small admin product tables overflowed after adding edit controls | Actions stack at narrow widths; toolbar filters have aligned labels and full-width mobile controls |
| No reviews in the original model | Purchase-backed review lifecycle, distribution, helpful votes, customer management, vendor feedback and admin moderation |
| Review sign-in could fall back to Shop during navigation | Validated product-review return destination is retained through login and registration |
| Enlarged images doubled their layout size and required awkward scrolling | Full-screen viewer with 100–400% zoom, visible level, Fit, wheel/double-click zoom, bounded drag, thumbnails, previous/next, keyboard shortcuts and focus restoration |
| Positioned photo arrows moved under the pointer on press | Translation and pressed scaling use independent CSS properties, preserving their click target |

Photo zoom percentages are relative to the fit-to-view size. Browser checks exercised plus/minus, Fit, wheel and double-click zoom, mouse drag, photo buttons and thumbnails, Home/Escape, active focus and return to the opening button. Geometry tests verify pointer-anchored zoom and panning bounds, including portrait photos. Mobile layout was checked at 320 and 390px; desktop at 1440px. Pinch, double-tap and swipe handlers are implemented but have not been exercised on physical touch hardware. Reduced-motion rules are present; no claim is made of a physical-device or cross-browser accessibility certification.

### Current audit evidence

- `screenshots/audit-reviews-desktop.png` and `audit-reviews-mobile.png`: customer review, star breakdown and persisted helpful vote (QA data).
- `screenshots/audit-reviews-admin.png`: administrator review workspace and per-vendor filter.
- `screenshots/audit-gallery-viewer-desktop.png` and `audit-gallery-viewer-mobile.png`: redesigned photo viewer.
- `screenshots/audit-vendor-report-desktop.png` and `audit-vendor-report-mobile.png`: vendor-specific report calculations.
- `screenshots/audit-vendor-menu-mobile.png`: selected workspace navigation treatment.

These are local functional and visual checks, not a production-load benchmark. Most management lists retain client pagination after backend vendor filtering; reviews paginate on the server. Payment remains demo cash-on-delivery. Real payment/courier/refund services, email delivery and independent seller suborders remain outside the original implemented scope. No production deployment was performed.

---

## Authentication viewport correction — 10 October 2026

The login panel had a fixed 670px minimum height (620px at the tablet breakpoint), with the header and footer added on top. At 1280 × 720, the login document was 838px tall and registration was 876px tall. The storefront now has one dynamic-viewport-height flex column; the authentication content fills the remaining space and can grow when its contents require it. No document overflow is hidden and no form control is clipped.

- Removed the fixed authentication panel minimums; the image and form share the available height.
- Added a slim authentication support footer, keeping delivery/privacy links and copyright without repeating the wordmark.
- Adjusted title line height, short-screen spacing and registration privacy-note margins; retained full-size form controls and at least 40px support/demo hit areas.
- Mobile authentication inputs use 16px text to avoid the common small-input auto-zoom behaviour. This CSS safeguard was checked in the browser; physical iOS keyboard behaviour was not tested.
- Both login and registration have document height equal to viewport height at 1280 × 720, 1440 × 900, 1024 × 768, 390 × 844 and 320 × 740, with no horizontal overflow. At 320px the input height is 50px.
- At 844 × 390 landscape, content scrolls normally because the form cannot fit. Expanded demo accounts also grow the document (914px at the 720px viewport); all three role options remain accessible. A failed sign-in message fits within the 720px layout.
- The signed-in empty bag page still fits at both 1280 × 720 and 320 × 740. No cart/order/account data was modified; sign-in tests used a separate localhost browser session against the QA store.
- Production build and `git diff --check` pass. Frontend lint remains at 27 existing warnings and zero errors. Backend tests were not rerun for this layout-only change.
- Evidence: `screenshots/auth-viewport-desktop.png` and `screenshots/auth-viewport-mobile.png`.

## Earlier verification passes

Verified locally on 10 October 2026. Development data is in the local `forme` PostgreSQL database; automated integration tests use the separate `forme_test` database.

## Automated checks

- Production Vite build passes.
- 4 inventory/status unit tests and 23 integration tests pass.
- `git diff --check` passes.
- Frontend lint exits with no errors and 27 warnings: loading-state updates in effects, effect dependencies/ref cleanup and hooks/helpers exported alongside components. This is not a warning-free lint run.

Integration coverage includes registration and password hashing, live role enforcement, catalogue visibility/search, authenticated cart merging compatibility, address validation, server prices, duplicate checkout, competing purchases of the last unit, transaction rollback, repeated/concurrent cancellation, immutable order snapshots, delivery costs, ownership, fulfilment transitions, and admin handling of mixed-vendor orders.

New address tests exercise CRUD ownership, customer-only access, input validation, concurrent default changes, default promotion after deletion, cross-account checkout rejection, immutable delivery snapshots after address changes/removal, and atomic/idempotent saving during checkout. Additional checks cover creating/renaming categories and order images stored in a product gallery.

## Browser walkthroughs

Tested in the Codex in-app browser at 1440 × 1050 and 390 × 844:

- Guest browsing remains public. Direct bag access opens a contextual sign-in screen.
- Guest Add to bag opens sign-in with the chosen product and quantity. Customer sign-in adds one item exactly once and opens `/shop`.
- Customer home shows the customer's name, all database categories and product cards. Marketing hero and large footer are absent when signed in.
- Account menu, Orders, Saved addresses, account details and sign-out work. Sign-out returns to the public landing; role dashboard sign-out returns to login.
- Saved Home and Work sample addresses; edited Work and made it the default. Checkout selected Work automatically.
- Saved-address checkout created FM-00004 for ₹1,039 (₹890 item + ₹149 standard delivery). Order and delivery details persisted after reload.
- Vendor demo login opened `/vendor`; the vendor confirmed FM-00004. Admin demo login opened `/admin`; the admin moved that order through Shipped to Delivered. Customer order history displayed Delivered after a fresh login.
- Vendor restocking opens a custom themed dialog. Escape closes it. No stock was added during this check.
- Admin role filtering returned the two vendors using the custom dropdown.
- Created a temporary Textiles category through admin. It appeared in the storefront sidebar without code changes; opening it showed the empty-category state. Only this empty test category was subsequently removed.
- Custom sort menu supports arrow keys, Enter and Escape; Escape restores focus to its trigger. Mobile category selection, product search and drawer dismissal work.
- Search submit hover is a square, flush segment inside the field. Inspected geometry: 440 × 44 field, 44 × 42 inner button, 1px border, 0px button radius.
- Mobile catalogue had no horizontal overflow, broken images or visible native selects. Category imagery, controls, checkout and compact footer were visually reviewed at both sizes.
- Final clean-browser checks reported no new console errors.

FM-00004 and two saved addresses are intentional local demonstration records with sample data. Existing user-created orders and accounts were preserved. No payment, external email or physical shipment was triggered.

## Admin and seller redesign verification

Checked the shared management shell, all seven admin pages and all four seller sections. Visual review used 1440 × 1000 desktop and 390 × 844 mobile viewports.

- Created and renamed a temporary category through the admin drawer; the saved label and URL appeared correctly. A new API guard returns a useful conflict when removing a category that still contains products, including hidden listings.
- Opened admin product details, account management, vendor requests and reports. Reports are calculated from saved orders. No new roles or permissions were granted during UI verification.
- Opened the custom role dropdown inside a native modal. Escape dismissed the dropdown and returned focus to its trigger while leaving the dialog open. Dropdown portals stay inside their modal, so the browser does not make their controls inert.
- Created a seller product, edited its price, changed its visibility to draft, reopened the private draft, and added stock from 4 to 6 without publishing it. The walkthrough found and fixed the old create endpoint ignoring requested draft status.
- Created a second draft with zero stock through the mobile form. It remained DRAFT in the database. Product forms now initialise from loaded data without clearing the saved category and visibility.
- Added one marked local order fixture and confirmed it through the mobile seller drawer. The updated status appeared in the table. The existing user orders were not changed.
- Opened mobile navigation and followed links to Orders, Products and Your studio; the menu dismissed on navigation. Product and category tables retain their essential information at mobile width. Page width equalled the 390px viewport; inventory had no broken images.
- Extended integration coverage for private draft creation/editing/restocking/publishing, category conflicts and the mixed-vendor fulfilment capability flag. Extended status unit coverage for hidden listings at zero stock.
- Removed only the two temporary products, the marked order and the temporary category after verification. Existing accounts, the six seed products and orders 1–4 were preserved.

Table pagination and search are currently client-side for management endpoints. This is adequate for the seeded demonstration, not a benchmark for large catalogues. Vendor-approval and role-change writes were not manually repeated during this visual redesign.

## Header and shared-control polish verification

Checked at 320 × 760, 390 × 844 and 1440 × 900. The bag count sits at the icon's top right; zero is hidden. Browser checks covered 0, 1, 12 and 13 items. The visual `99+` cap retains the exact accessible count (code-reviewed; not populated with 100 demo items).

- Mobile header actions measure 44 × 44px; cart quantity buttons measure 40 × 40px. Header and cart had no horizontal overflow at 320px.
- Focused desktop and mobile search forms have no blue outline. A darker border marks input focus, and an inset dark ring marks keyboard focus on the submit arrow.
- Account, remove-item and quick-add buttons provide contextual accessible labels. Busy states are exposed; disabled buttons do not respond visually to hover. Icon corner shapes remain stable on hover, and pressed transforms respect reduced-motion preferences.
- An add-to-bag notification stayed visible beyond its normal expiry while its dismiss button had keyboard focus; it dismissed after focus left. No new console errors or warnings appeared after a clean reload.
- Production build and whitespace checks pass; lint has no errors and the same 27 warnings. Backend tests were not repeated for this frontend-only pass.
- Removed only the temporary Daybreak Cup & Saucer bag line used for these checks, restoring the demo customer's originally empty bag. No orders or stock were changed.

## Product workflow audit and gallery verification

The product audit found six connected gaps: editing collapsed multiple photos into one; sellers could only paste one URL; customers lacked gallery arrows and an enlarged view; factual product specifications had no editor; sold-out listings disappeared from discovery; and archived products disappeared from the seller's own list. These are addressed in the current implementation, alongside quantity limits accounting for units already in the bag and draft-aware low-stock alerts.

- The additive migration preserves existing products, image references and orders. Gallery position/alt text, product specifications and uploaded asset ownership are stored in PostgreSQL. Image files persist separately on disk.
- New integration tests verify ordered create/edit/read, cover synchronization, descriptions/specifications surviving unrelated edits, legacy string image arrays, duplicate/max-image rejection, publish-without-photo rejection and safe removal when saving a draft.
- Upload tests cover authentication, customer rejection, mismatched content types, invalid image bytes, SVG rejection, the 8 MB limit, resized WebP output, public serving, metadata removal and cross-seller attachment/edit denial.
- Availability tests verify public discovery of sold-out products, blocked add-to-bag, price precision and product-detail validation. Archive tests verify ownership, retained photos/stock/details and restoration to a private draft.
- Browser walkthrough: uploaded three existing local sample photos using the actual file picker, described and reordered them, saved and reopened the draft, changed its cover and published it. All photos and product facts survived. A deliberately named temporary listing was used; its photos were unrelated test fixtures, not extra angles invented for existing products.
- At 1440px and 390px, reviewed seller and customer layouts and checked for horizontal overflow/broken photos. Verified customer arrows, thumbnails, Home/arrow keys, enlarged view, 2× zoom, Escape and focus restoration. Touch-swipe handling is implemented but was not exercised on physical touch hardware.
- Guest Add to bag retained a quantity of three across customer sign-in. The product then displayed the three units already in the bag and disabled adding beyond available stock. No order was placed.
- Restored the temporary archived listing through the seller detail drawer; it returned as a draft with the three photos intact. Seller and admin detail drawers share the gallery implementation; the admin path was code-reviewed rather than separately signed in again in this pass.
- Removed only the walkthrough product, its bag line and its three uploaded assets after checking for other references. Existing store records, including orders created by the user during this work, were preserved.
- Production build passes, formatting/whitespace checks pass and frontend lint remains at 27 warnings with no errors. All 4 unit and 23 integration tests pass against the isolated local test database.

Remaining product/store gaps are documented in README: variants with separate inventory, wishlists, email/password-reset delivery, real payment/courier/refund workflows and separate seller fulfilment inside mixed-vendor orders. Upload storage is local/persistent-volume storage; cloud storage and unused-file retention are not configured. This pass does not certify the entire store as production-ready.

## Concrete, cobalt and terracotta theme verification

The visual reference is Cemnt Café's concrete structure, cobalt metalwork and burnt-orange accents. This is a close interpretation of that material palette, not a measured percentage match or a copy of an existing café website.

- Checked the public landing at 1440 × 1000, 390 × 844 and 320 × 740; no page overflow at the smallest width. The mobile headline keeps clear three-line wrapping.
- Reviewed signed-in shopping at desktop and mobile widths, the custom category menu, product view, bag and saved-address checkout. Added one cup, checked the badge/toast and checkout, then removed that exact line to restore the initially empty bag. No order was placed.
- Checked desktop admin overview/categories and the category drawer, the mobile admin navigation, desktop vendor overview/editor and mobile photo controls. No category, product or account data was edited during this theme pass.
- Header search retains no outer outline while focused; computed form and input outline styles are `none`, and the border becomes charcoal. Other keyboard controls retain visible focus, including white focus indicators on the blue navigation and footer.
- Contrast calculations for the shared foreground/background pairs: muted text on concrete 4.85:1; dark terracotta text on concrete 4.89:1; white on terracotta 4.83:1; cobalt on concrete 4.85:1; white on cobalt 6.68:1. This is a palette check, not a whole-site accessibility certification.
- Production build and formatting/whitespace checks pass. Frontend lint reports the existing 27 warnings and no errors. No browser console errors were recorded in the verification tab. Backend tests were not repeated for this CSS/identity-only change.
- Current theme previews: `screenshots/cemnt-storefront-desktop.png`, `cemnt-storefront-mobile.png`, `cemnt-shop-desktop.png`, `cemnt-shop-mobile.png`, `cemnt-admin-desktop.png`, `cemnt-admin-mobile-menu.png` and `cemnt-vendor-desktop.png`.

## Current screenshots

- `screenshots/vendor-photo-editor.png` and `vendor-photo-editor-mobile.png`: photo upload, cover/order controls and descriptions.
- `screenshots/customer-product-gallery.png` and `customer-gallery-mobile.png`: customer carousel and vendor-provided product details.

- `screenshots/header-controls-desktop.png`: neutral search focus and a two-digit bag badge.
- `screenshots/header-controls-mobile.png`: mobile header and badge at 390px.

- `screenshots/admin-categories.png`: redesigned category workspace.
- `screenshots/vendor-workspace.png` and `vendor-products.png`: seller overview and inventory.
- `screenshots/mobile-admin-categories.png` and `mobile-vendor-products.png`: responsive management views.
- `screenshots/customer-shop.jpg` and `customer-shop-full.jpg`: signed-in desktop home.
- `screenshots/mobile-customer-shop.jpg`: signed-in mobile home.
- `screenshots/guest-add-login.jpg`: login wall before adding an item.
- `screenshots/saved-addresses.jpg`: sample address book.
- `screenshots/mobile-saved-checkout.jpg`: saved-address selection and checkout.
- `screenshots/mobile-custom-sort.jpg`: themed mobile sort menu.
- `screenshots/search-alignment.jpg`: corrected search button hover.

Earlier screenshots in this folder document the first design iteration and may show superseded navigation.

## Boundaries

This verifies the customer shopping flow, product workflow and management interactions listed above. It is not an exhaustive audit of every seller/admin feature, every browser/device, or deployment security. Payments are recorded as cash on delivery for the demo. Live payment providers, courier tracking, refunds and seller-specific suborders are not implemented.
