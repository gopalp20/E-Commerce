# FORME - submission and demonstration guide

## Start here

FORME is a multi-vendor e-commerce demo with a React frontend, Express API and Neon PostgreSQL database. Cash-on-delivery orders are persisted records, not a payment or courier integration.

1. Install Node.js 22.12+ and open the project root.
2. Run `npm run setup` (or `npm.cmd run setup` on Windows).
3. Copy `backend/.env.example` to `backend/.env` and enter your Neon DATABASE_URL, private JWT_SECRET, and CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET for photo uploads. Existing copies should edit their actual environment file. Keep PORT=5050 for the default API port.
4. Run `npm run db:setup` once for migrations and demo accounts, then `npm run dev`.
5. Open **http://127.0.0.1:5173** when the launcher reports ready. Keep the terminal open. Later starts only need `npm run dev`.

Startup uses Neon only and never automatically changes the shared database schema or seed data. After future schema updates, explicitly run `npm run db:migrate`. All computers pointing to the same Neon database see the same records. Existing local records are not transferred automatically. Keep credentials out of Git and use an independent test branch for integration tests.

## Accounts

Use the role buttons on the sign-in screen or enter these details. All four newly seeded demo accounts use **FormeDemo2026!**.

| Role | Email | What to demonstrate |
| --- | --- | --- |
| Customer | hello@forme.demo | Shop, save, bag, addresses, orders, reviews |
| Vendor: Form & Field | studio@forme.demo | Listings, galleries, stock, own orders, feedback |
| Vendor: Everyday Studio | objects@forme.demo | A second seller with separately scoped data |
| Administrator | admin@forme.demo | Categories, people, vendor approvals, orders, moderation, reports |

Sign out before switching roles. New registration always creates a customer. For a fresh vendor approval demonstration, register a sample customer, apply under the account page, then approve from the admin's Vendor requests page. No public registration can request an administrator role.

## A 10-12 minute presentation

### 1. Public browsing (1 minute)

Open the public home while signed out. Show the FORME identity and local photographs. Open Shop; use search, category, price, availability and sort. Categories come from the database. Explain that browsing is public and a bag/save action asks the visitor to sign in.

### 2. Customer purchase (3 minutes)

Open **Daybreak Cup & Saucer**, choose a quantity of one, and Add to bag. Sign in as the customer; the selected item carries through sign-in. Show the named shopping home and bag badge. Save another product using its heart, open Saved items and move it to the bag or remove it before the demonstration order.

Add a sample delivery address, for example: Alex Morgan, 9000000000, 12 Demo Lane, Hyderabad, Telangana, 500001, India. Use fictional details for demonstrations. Show the saved/default address at checkout. With just the seeded cup at INR 890, standard delivery is INR 149 and the order total is INR 1,039; use the on-screen current prices if products have been edited. Submit the demo order and reload its detail page to prove persistence.

### 3. Seller fulfilment (2 minutes)

Sign out and open the vendor account that owns the purchased product. The cup belongs to Form & Field (`studio@forme.demo`). Open Orders and move this single-vendor order through Confirmed, Shipped and Delivered. Statuses represent manually recorded demo fulfilment; no courier is contacted. A mixed-vendor order must be handled by an admin because it currently has one shared status.

In Products, open an existing listing to show descriptions, category, price, stock, draft/published state, product facts and photo ordering. A gallery supports up to ten images. With Cloudinary configured, upload your own JPG/PNG/WebP photographs; `frontend/public/images/` has local sample images if needed. Save the product and open it from another browser/computer to demonstrate shared cloud delivery. A draft can be saved before it has a publishable photo. Do not describe unrelated sample photos as different angles of the same item.

### 4. Verified purchase review (2 minutes)

Sign back in as the customer. Open the delivered order and choose Review this item. Submit a star rating, title and review text. Show the public rating breakdown and My reviews edit controls. A pending purchase cannot review yet; the API checks delivery and ownership. To demonstrate Helpful, use a second customer account: authors cannot vote for themselves.

### 5. Admin operations (2 minutes)

Sign in as admin. Show Products, Orders, Reviews and Reports scoped by vendor. In Categories, add a clearly named sample category, then show it in the public catalogue without editing code. A category containing products cannot be deleted. Review the vendor requests screen. In Reviews, hide the sample review with a reason, show that its public rating is removed, then restore it if desired.

### 6. Reliability (1 minute)

Create another small order and cancel it before shipment. Explain and show stock returning. Set TEST_DATABASE_URL to a separate Neon test branch, then run `npm test`. The suite uses that explicit test database and tests competing buyers, repeat checkout/cancellation, permissions, addresses, reviews, uploads, saved items and catalogue filters.

## Useful presentation answers

- **Why React and Express?** React manages interactive role-specific screens; Express exposes the same business API to each screen. Prisma gives typed database access and versioned schema migrations. PostgreSQL holds relational ownership and transactional inventory updates.
- **Why is authentication not enough?** Every protected request loads the current user and checks the current role. Controllers also check ownership, so another vendor's product or another customer's address cannot be edited by changing an ID.
- **What happens if two customers buy the last item?** Checkout reserves stock inside a transaction. Conditional updates and transaction retries prevent both requests succeeding for unavailable inventory; failures roll back the entire order.
- **What prevents duplicate orders?** A customer-scoped checkout key identifies retries. The server records a request fingerprint and returns the original order for a matching retry rather than charging stock twice.
- **Why store product and address snapshots?** An old order should remain accurate after a seller changes the name/price/photo or a customer edits an address.
- **How are ratings trustworthy?** A delivered purchase is required, one review is allowed per customer/product, and only published reviews count. Hidden reviews stay hidden after the author edits them.
- **Is revenue money collected?** No. Reports display non-cancelled order value. The demo does not process or reconcile payments.
- **How does the design remain consistent?** Shared form/dialog/menu/gallery components, typography and colour tokens; separate public, customer and management layouts; reduced-motion support and explicit empty/error/loading states.

## Troubleshooting

| Situation | What to do |
| --- | --- |
| Port already in use | Close the previous FORME terminal using Control-C. The launcher never kills another application's process. |
| Need independent demo data | Use a separate Neon branch/database and configure its DATABASE_URL. For another app copy on the same computer, choose unused FORME_API_PORT and FORME_WEB_PORT values. |
| API/web port conflicts | Change PORT / FORME_API_PORT and/or FORME_WEB_PORT. The UI proxy follows the selected API port. |
| Launcher refuses the environment | Set DATABASE_URL to your Neon PostgreSQL URL with sslmode=require, and set JWT_SECRET. Local database URLs are no longer accepted. |
| Photo uploads are not configured | Set all three CLOUDINARY_* values in backend/.env, run npm run db:migrate after this update, and restart the API. Keep the API secret out of frontend variables. |
| An older uploaded photo is missing on another computer | Run npm run media:migrate on the computer holding that photo and using the same Neon records. Missing local files are reported; originals are retained. |
| Login fails after switching project copies | Each origin has its own account session. Sign out and sign back in on the intended port. |
| A review button is unavailable | Confirm that this customer owns a delivered order for this product. |
| A vendor cannot update an order | Check product ownership and whether the order contains products from multiple sellers; an admin handles mixed orders. |
| Products still appear after archive | Sold-out products remain visible; archived/private products do not. Existing saved items and orders retain safe snapshots. |

## Data and boundaries

Back up the Neon database, Cloudinary media library and any remaining legacy files in `backend/.local/product-media` (or MEDIA_DIRECTORY). New uploads are shared through Cloudinary; `npm run media:migrate` moves older uploaded files while preserving links. Preserve old local database folders if you may need to export their records later. Keep `.env` and private credentials out of source archives.

Implemented scope: original multi-vendor handoff plus saved addresses, photo upload/gallery/zoom, specifications, review moderation, saved items, richer discovery, per-vendor admin filtering and motion/accessibility improvements.

Remaining scope: real online payments, courier integrations, returns/refunds, tax calculation, email verification/reset delivery, variants/SKUs, seller suborders and large-catalogue server pagination for management tables. The current admin lists paginate in the client. Public deployment, browser/device certification and zero-defect guarantees are not included. Consult [verification](VERIFICATION.md) for evidence and [architecture](../DATA_FLOW_AND_ERD.md) for the implementation map.
