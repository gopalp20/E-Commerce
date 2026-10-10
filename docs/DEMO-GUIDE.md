# FORME - submission and demonstration guide

## Start here

FORME is a working local multi-vendor e-commerce college project. The submission source contains the React frontend, Express API, PostgreSQL migrations, seed catalogue, tests, local product photos and project documentation. Orders and reviews are real database records; cash-on-delivery is a demo payment choice, not a payment integration.

1. Extract the source ZIP to a normal folder on your computer.
2. Install Node.js 22.12 or newer (verified here with the installed Node runtime). Internet is required for the first dependency installation.
3. In that folder run `npm run setup`, then `npm run dev`.
4. Wait for **FORME is ready**, then open **http://127.0.0.1:5173**.
5. Keep that terminal running. Control-C stops the app and database; starting again preserves your records.

Do not copy an old `.env` into a fresh submission. The launcher creates local credentials and a database automatically. The example environment files are reference templates, not files you must copy for the local launcher. The ZIP excludes passwords, database files, local uploads from the developer's store and Git authentication settings. The clean seed contains six products, four categories and four demo accounts; it does not invent orders or reviews.

Tested host: macOS Apple Silicon. The embedded PostgreSQL package includes platform-specific binaries, but Windows/Linux and physical mobile devices have not been exercised here. Run setup and the walkthrough on the presentation machine before presenting. On restricted lab machines, install dependencies ahead of time.

## Accounts

Use the role buttons on the local sign-in screen or enter these details. All four local demo accounts use **FormeDemo2026!**.

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

In Products, open an existing listing to show descriptions, category, price, stock, draft/published state, product facts and photo ordering. A gallery supports up to ten images. To demonstrate uploading, use your own JPG/PNG/WebP photographs; `frontend/public/images/` has local sample images if needed. A draft can be saved before it has a publishable photo. Do not describe unrelated sample photos as different angles of the same item.

### 4. Verified purchase review (2 minutes)

Sign back in as the customer. Open the delivered order and choose Review this item. Submit a star rating, title and review text. Show the public rating breakdown and My reviews edit controls. A pending purchase cannot review yet; the API checks delivery and ownership. To demonstrate Helpful, use a second customer account: authors cannot vote for themselves.

### 5. Admin operations (2 minutes)

Sign in as admin. Show Products, Orders, Reviews and Reports scoped by vendor. In Categories, add a clearly named sample category, then show it in the public catalogue without editing code. A category containing products cannot be deleted. Review the vendor requests screen. In Reviews, hide the sample review with a reason, show that its public rating is removed, then restore it if desired.

### 6. Reliability (1 minute)

Create another small order and cancel it before shipment. Explain and show stock returning. Run `npm test` in another terminal while the store is running. The suite uses a separate test database and tests competing buyers, repeat checkout/cancellation, permissions, addresses, reviews, uploads, saved items and catalogue filters.

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
| Need a second independent copy | On its first start, set FORME_DB_PORT, FORME_API_PORT and FORME_WEB_PORT to unused, different ports. Example on macOS/Linux: `FORME_DB_PORT=55433 FORME_API_PORT=5052 FORME_WEB_PORT=5175 npm run dev`. Keep using its saved database port on later starts. |
| API/web port conflicts on later starts | Set only FORME_API_PORT and/or FORME_WEB_PORT. The database port is stored in that copy's `.local/database.json`. |
| Launcher refuses the environment | It has detected a database URL outside that copy's local database. Keep deployment credentials in a separate environment; do not overwrite working local data. |
| Login fails after switching project copies | Each origin has its own account session. Sign out and sign back in on the intended port. |
| A review button is unavailable | Confirm that this customer owns a delivered order for this product. |
| A vendor cannot update an order | Check product ownership and whether the order contains products from multiple sellers; an admin handles mixed orders. |
| Products still appear after archive | Sold-out products remain visible; archived/private products do not. Existing saved items and orders retain safe snapshots. |

## Data and boundaries

Keep `.local/postgres`, `.local/database.json`, `backend/.env` and `backend/.local/product-media` together for a local backup while the app is stopped. Do not include these private runtime folders in a source submission. The archive can always recreate the clean seeded demo with the setup commands.

Implemented scope: original multi-vendor handoff plus saved addresses, photo upload/gallery/zoom, specifications, review moderation, saved items, richer discovery, per-vendor admin filtering and motion/accessibility improvements.

Remaining scope: real online payments, courier integrations, returns/refunds, tax calculation, email verification/reset delivery, variants/SKUs, seller suborders and large-catalogue server pagination for management tables. The current admin lists paginate in the client. Public deployment, browser/device certification and zero-defect guarantees are not included. Consult [verification](VERIFICATION.md) for evidence and [architecture](../DATA_FLOW_AND_ERD.md) for the implementation map.
