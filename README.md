# FORME

A small multi-vendor store for home, workspace and everyday objects. Built with React, Vite, Express, Prisma and PostgreSQL. This is a college demonstration: orders are persisted, but no real payment or shipment takes place.

## Open the project

Requirements: Node.js 22.12+ and npm, a Neon PostgreSQL database, and a Cloudinary product environment for photo uploads. Fonts and seed photographs are served locally after dependency installation.

1. Run `npm run setup` to install locked dependencies and generate Prisma.
2. Copy `backend/.env.example` to `backend/.env`. Set `DATABASE_URL` to your Neon connection string (including `sslmode=require`), a private `JWT_SECRET`, and the three `CLOUDINARY_*` values described below. Keep `PORT=5050` for the default API port. Existing installations should update their actual `.env`, not the example file.
3. Run `npm run db:setup` once to apply migrations and create the demo catalogue/accounts. This explicitly adds demo users to the configured Neon database and preserves existing matching records. For an existing database where you only want migrations, use `npm run db:migrate`; `npm run db:seed` separately adds the demo data. Never use database reset to fix migration errors on an existing database.
4. Run `npm run dev`.

```sh
npm run setup       # first installation / dependency changes
# Configure backend/.env with your own Neon URL and JWT secret.
npm run db:setup    # first database setup: migrations + demo accounts
npm run dev         # every subsequent start: API + frontend only
```

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. Generate a private JWT secret with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and save it only in your environment file.

Open **http://127.0.0.1:5173**. API: `127.0.0.1:5050` by default. The API port follows `PORT` in your environment; `FORME_API_PORT` and `FORME_WEB_PORT` can override the API and frontend ports. The frontend proxy follows the selected API port automatically. The launcher verifies the page and proxied API before reporting ready and refuses occupied ports without terminating other applications. Control-C stops the app; Neon keeps the data.

**Neon is the only application database.** Startup does not launch PostgreSQL, generate/replace `.env`, or automatically migrate/seed a shared database. Internet access is required while using the app. Computers using the same Neon database share users, products and orders. Old `.local/postgres` folders are left untouched; their records are not automatically copied to Neon. `backend/.env` stays ignored by Git. Use fresh credentials rather than secrets previously shared in chat.

New product uploads live in Cloudinary. Neon holds their owner, stable application URL, Cloudinary public ID and HTTPS delivery URL, so computers sharing Neon can display those photos without copying files. Older uploads remain readable from their original API computer until explicitly migrated with `npm run media:migrate`.

## Try the shopping flow

1. Explore the collection; search, filter by category/price, or sort.
2. Open an object and choose a quantity. Clicking Add to bag asks guests to sign in; browsing stays public.
3. Sign in using a demo role button, or register your own demo customer. The chosen item is added once, then the customer shopping home opens.
4. Save a **sample** Indian address under Account → Saved addresses, or enter one at checkout. Choose a saved address and standard or express delivery.
5. Place the pay-on-delivery order. Review the saved address, totals and items in Your orders.
6. Cancel while Pending or Confirmed. Stock is restored exactly once.

Demo accounts all use the password `FormeDemo2026!`. These accounts are for local demonstration only.

| Account | Email |
| --- | --- |
| Customer | `hello@forme.demo` |
| Vendor — Form & Field | `studio@forme.demo` |
| Vendor — Everyday Studio | `objects@forme.demo` |
| Administrator | `admin@forme.demo` |

The development sign-in page has Customer, Vendor and Admin buttons that fill the corresponding details. Sign out to switch roles. Customers land at `/shop`, vendors at `/vendor`, and admins at `/admin`. The seeded catalogue has six illustrative products from two sellers. Seeding preserves existing accounts, product edits and orders.

## What is working

- FORME wordmark, F favicon, warm paper/ink/cobalt design, responsive storefront and local photography.
- Catalogue, search, category/price/availability/rating filters, sorting, pagination, product pages and stock states.
- Separate public landing and signed-in shopping home; named account menu, compact account footer, and login required at Add to bag or direct bag access.
- Database-driven category tiles, catalogue sidebar/mobile category selector, custom keyboard-accessible dropdowns and themed top-centre toasts.
- Persistent customer bag and saved addresses: create, edit, remove, choose a default and reuse at checkout. Addresses belong only to their customer.
- Server-validated delivery address, standard delivery (₹149, free at ₹2,500 subtotal), express delivery (₹299), and cash-on-delivery order recording.
- Transactional stock reservation; all-or-nothing checkout; duplicate submissions return the same order; saved product, price and address snapshots.
- Order history, cancellation and stock restoration.
- Redesigned admin and seller workspaces: shared FORME navigation, real order metrics, searchable tables, custom detail/edit drawers and responsive mobile layouts.
- Admin category and account management, vendor requests and reports calculated from saved orders. Seller product drafts, editing, publishing, restocking and fulfilment controls.
- Seller photo uploads and ordered galleries: up to ten JPG, PNG or WebP photos, cover selection, descriptions, reordering and removal. Uploads are validated and optimised; customers get thumbnails, arrow/keyboard navigation, touch swipe, an enlarged viewer and zoom. Admins can inspect the same gallery.
- Seller-managed product specifications displayed to customers; publishing requires a photo. Sold-out listings remain discoverable and cannot be purchased. Bag quantities are taken into account by product-page and quick-add controls.
- Archived products remain accessible to their seller and can be restored as private drafts with their photos and details intact. Drafts do not inflate low-stock alerts.
- Loading, empty, error and retry states; labelled form controls, native modal focus handling, visible keyboard focus and reduced-motion styles.

The storefront does not keep a guest bag. It carries the selected product through sign-in and then adds it to the authenticated account. Checkout checks live price and stock again. Saved addresses are copied onto orders; later edits or removal do not change past orders.

## Verification

Set `TEST_DATABASE_URL` in `backend/.env` to an independent Neon test branch/database before running the full suite. It must differ from the application database; direct/pooler aliases of the same Neon endpoint are rejected. Tests apply migrations and clean up their own fixtures on that test target. The frontend and backend unit/configuration tests need no database: `npm run test:unit`.

```sh
npm test        # includes integration tests; requires TEST_DATABASE_URL
npm run build   # production frontend bundle
npm run lint    # frontend lint; existing and effect/fast-refresh warnings are documented
```

Integration tests require an explicit test target and never reset the store database. Do not set TEST_DATABASE_URL to a database holding real customer records.

For the presentation, start with the [demo guide](docs/DEMO-GUIDE.md) and [architecture/ER reference](DATA_FLOW_AND_ERD.md).

See [verification notes](docs/VERIFICATION.md), [design direction](docs/FORME-DESIGN.md), and [photo sources](docs/photo-sources.json).

## Structure

- `frontend/src/pages/storefront/`: customer pages.
- `frontend/src/components/forme/`: brand, form, dialog, quantity and order-summary primitives.
- `frontend/src/components/management/`: shared admin/seller shell, tables, drawers, order and inventory screens.
- `frontend/src/context/`: authentication, cart, category and toast state.
- `backend/services/addressService.js`: saved-address limits and default-address rules.
- `backend/routes/mediaRoutes.js`: authenticated image uploads and public image serving.
- `backend/services/productGalleryService.js`: ordered galleries, covers and upload ownership.
- `backend/services/checkoutService.js`: stock, delivery totals, checkout and order transitions.
- `backend/prisma/`: schema, additive migrations and explicit demo seed.
- `scripts/dev.mjs`: local service launcher.

## Product photos

In the seller studio, open Products → Add product or Edit → Product photos. Choose files (or drop them), describe each view, move photos into order and choose a cover. Save the product to publish those gallery changes. Product details accept up to twelve labelled facts such as dimensions, materials, care and package contents. Archived → Restore returns a listing to Draft for review before publishing.

Uploads accept non-animated JPG, PNG and WebP files up to 8 MB and 40 megapixels. [Sharp](https://sharp.pixelplumbing.com/api-constructor/) validates and decodes them; the server rotates, limits the longest edge to 2,000px and sends WebP bytes without the original metadata to Cloudinary. Image identifiers are generated by the server. An uploaded image can only be attached by its owner or an administrator managing that seller's product, including when using its direct CDN URL.

### Connect Cloudinary

Get the cloud name, API key and API secret from your Cloudinary product environment's API Keys settings. Add them only to `backend/.env` (or the backend host's secret environment):

```dotenv
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

For an existing checkout, run `npm run setup`, then `npm run db:migrate`, and restart the API. The [official Node SDK](https://cloudinary.com/documentation/node_image_and_video_upload) performs signed server-side uploads; no unsigned preset or frontend secret is needed. The app uses generated IDs under `forme/products/<owner>/<id>` and never overwrites existing assets. If Cloudinary is missing or unavailable, uploads show a clear error instead of silently saving files on one computer. Browsing existing products still works.

The application keeps `/api/media/images/…` references stable. The API looks up the saved Cloudinary URL and redirects the browser to its HTTPS image delivery URL. Those `/api` routes must still reach the backend in deployments. Removing a photo from a gallery retains its stored asset so old orders keep their images. A failed database save triggers cloud cleanup; a failed cleanup logs the generated public ID for manual retry. Automated unused-asset retention is not configured.

### Move older uploaded photos

After configuring Cloudinary and applying migrations, run `npm run media:migrate` **on the computer holding the old image files**. It reads `backend/.local/product-media` (or `MEDIA_DIRECTORY`), uploads existing media records, and updates only their storage metadata. Product galleries and order snapshots keep the same links. Already migrated assets are skipped, missing files are reported, and local originals are retained. It does not transfer a local PostgreSQL database into Neon: the media records must already be in the configured database. Bundled `/images/…` seed photos and externally linked photos are unchanged. Back up Neon, the Cloudinary library and any legacy local files you keep.

## Reviews and ratings

Customers can review a product once a purchase is delivered. Open the delivered order → **Review this item**, or the product's **Ratings & reviews** section. One review is allowed per customer/product; the customer can edit/delete it under **Account → My reviews**. Reviews include stars, a title and text. The storefront shows real average ratings, a star breakdown, filters, sorting, pagination and helpful votes.

Vendors can read reviews for their products under **Seller studio → Reviews**. Administrators use **Reviews** to filter by vendor/rating/visibility and hide or restore a review. Hiding requires a reason and removes the review from public ratings. Customer edits cannot undo moderation. No reviews are seeded or fabricated.

The image viewer has fit-to-view controls, 100–400% zoom, pointer-anchored wheel/double-click zoom, bounded dragging, thumbnail navigation and keyboard support. `+`/`-` zoom, `0` fits, left/right selects a photo, Shift+arrows pans, and Escape closes. Touch gesture support is implemented; physical touch hardware has not been tested.

Admin Products, Orders, Reports and Reviews support per-vendor filtering. Vendor reports use only that vendor's purchased item values, excluding other sellers and delivery fees.

See [verification](docs/VERIFICATION.md) for the requirement matrix, test evidence and current boundaries. Reviews do not yet include customer photo/video uploads, seller replies or reporting.

## Saved items and discovery

Tap the heart on a product card or **Save for later** on the product page. Guests sign in or register and their selected item is saved once. Open **Account → Saved items** (also available in mobile navigation). Lists are private to each customer, persist across sign-ins, and contain up to 200 items with 12 per page.

**Save for later** in the bag moves the item and quantity together in one transaction. **Move to bag** checks the current price, quantity and stock, and removes the saved item only after the move succeeds. Retried requests cannot double quantities. Items already in the bag offer **View bag**. Saved items show a price-change note relative to when they were saved; sold-out or withdrawn products stay removable, with buying disabled. A saved item does not reserve stock or a price. Guest lists without an account, shared lists and notifications are not implemented.

The catalogue supports **In stock only**, **Customer rating**, **Highest rated** and **Best selling**, alongside its existing categories, search and prices. Active filters can be removed individually; clearing filters preserves sorting. Filters live in the URL and survive reloads. Rankings and counts are calculated in the database before pagination: only published reviews influence ratings, and only units in delivered orders influence best-selling order. Unrated and unsold products remain in unfiltered results. Product cards identify items already in the bag.

## Next milestones

The customer shopping journey and seller-managed product gallery are implemented. Seller-specific suborders for mixed-vendor fulfilment, variants with their own stock/SKUs, payment-provider integration, email/password-reset delivery, courier tracking and refund workflows remain separate milestones. The current mixed-vendor order can be updated by an administrator; a vendor can update an order only when all its items belong to that vendor. These remaining workflows are not represented by pretend controls in the store.

Before public hosting, finish the deployment configuration, use fresh service credentials, remove demo accounts, and add production authentication/rate limiting, operational logging, backups and payment/shipping provider integration as appropriate. No deployment is included in this change.
