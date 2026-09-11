# Multi-Vendor E-Commerce Platform - Data Flow & ER Diagram

> [!TIP]
> **Instant Visual Diagram**: Open [ER_DIAGRAM.html](file:///c:/Users/gopal/Desktop/project/ECom/ER_DIAGRAM.html) in your web browser (Chrome, Edge, etc.) for a fully rendered, interactive, full-color diagram experience!

---

## 1. Visual Database Schema (ASCII Entity Relationship Blueprint)

```
+---------------------------------------------------------------------------------------------------------+
|                                        MULTI-VENDOR DATABASE SCHEMA                                     |
+---------------------------------------------------------------------------------------------------------+

  +-----------------------+              +-----------------------+              +-----------------------+
  |        USER           |              |       CATEGORY        |              |     PRODUCT_IMAGE     |
  +-----------------------+              +-----------------------+              +-----------------------+
  | PK  id (Int)          |              | PK  id (Int)          |              | PK  id (Int)          |
  |     name (String)     |              |     name (String)     |              |     url (String)      |
  | UK  email (String)    |              | UK  slug (String)     |              | FK  productId (Int)   |---+
  |     password (Hash)   |              |     createdAt (Date)  |              |     createdAt (Date)  |   |
  |     role (Enum)       |              +-----------------------+              +-----------------------+   |
  |     vendorRequest     |                          |                                                      |
  |     createdAt (Date)  |                          | 1                                                    |
  +-----------------------+                          |                                                      |
         |         |                                 | classifies                                           |
       1 |         | 1                               V *                                                    |
         |         |                     +-----------------------+                                          |
  places |         | sells (Vendor)      |        PRODUCT        |<-----------------------------------------+
         |         |                     +-----------------------+
         |         +-------------------->| PK  id (Int)          |
         |                               |     name (String)     |
         |                               |     description (Text)|
         |                               |     price (Decimal)   |
         |                               |     stock (Int)       |
         |                               |     imageUrl (String) |
         |                               |     status (Enum)     |
         |                               |     deleted (Boolean) |
         |                               | FK  vendorId (Int)    |
         |                               | FK  categoryId (Int)  |
         |                               |     createdAt (Date)  |
         |                               +-----------------------+
         |                                       ^         ^
         |                                     1 |       1 |
         |                                       |         |
         |                               purchased         | in cart
         |                                       |         |
         |                                     * |       * |
         |         +-----------------------+     |   +-----------------------+
         |         |         ORDER         |     |   |         CART          |
         |         +-----------------------+     |   +-----------------------+
         +-------->| PK  id (Int)          |     |   | PK  id (Int)          |
                   | FK  userId (Int)      |     |   | UK  userId (Int)      |<---+ (1-to-1 User)
                   |     totalAmount (Dec) |     |   |     createdAt (Date)  |
                   |     status (Enum)     |     |   +-----------------------+
                   |     createdAt (Date)  |     |               | 1
                   +-----------------------+     |               | contains
                               | 1               |               |
                               | contains        |               V *
                               V *               |   +-----------------------+
                   +-----------------------+     |   |       CART_ITEM       |
                   |      ORDER_ITEM       |     |   +-----------------------+
                   +-----------------------+     |   | PK  id (Int)          |
                   | PK  id (Int)          |     |   | FK  cartId (Int)      |
                   | FK  orderId (Int)     |     |   | FK  productId (Int)---+
                   | FK  productId (Int)---+-----+   |     quantity (Int)    |
                   |     quantity (Int)    |         +-----------------------+
                   |     price (Decimal)   |
                   +-----------------------+

  +-----------------------+
  |        REVIEW         |
  +-----------------------+
  | PK  id (Int)          |
  | FK  productId (Int)---+-----> [PRODUCT]
  | FK  userId (Int)------+-----> [USER]
  |     rating (Int 1-5)  |
  |     title (String)    |
  |     comment (Text)    |
  |     createdAt (Date)  |
  +-----------------------+
```

---

## 2. Interactive Mermaid Architecture Diagram


```mermaid
graph TB
    subgraph Clients["Frontend Layer (React 19 + Tailwind CSS)"]
        CustomerUI["Customer Storefront<br/>(Catalog, Cart, Checkout, Reviews)"]
        VendorUI["Vendor Dashboard<br/>(Products CRUD, Order Fulfillment, Stats)"]
        AdminUI["Admin Console<br/>(Approvals, Users, Taxonomy, Analytics)"]
    end

    subgraph StateAndAPI["Frontend State & Communication"]
        AuthContext["AuthContext<br/>(JWT Token & User Role)"]
        CartContext["CartContext<br/>(Totals & Subtotals)"]
        AxiosClient["Axios Interceptor Layer<br/>(Bearer Token, Fallback Mock Engine)"]
    end

    subgraph BackendAPI["Backend Layer (Node.js + Express REST API)"]
        Router["Express API Gateway Router"]
        Middleware["Auth & RBAC Middleware<br/>(JWT Verify, Role Authorization)"]
        Controllers["Controllers<br/>(Auth, Products, Cart, Orders, Vendors, Admin)"]
        Services["Domain Services<br/>(Inventory Reserve, Pricing Engine)"]
    end

    subgraph DataLayer["Database & Persistence (Prisma ORM)"]
        Prisma["Prisma ORM Client"]
        Database[("PostgreSQL / MySQL DB")]
    end

    CustomerUI --> AuthContext & CartContext
    VendorUI --> AuthContext
    AdminUI --> AuthContext

    AuthContext & CartContext --> AxiosClient
    AxiosClient -->|"HTTP /api/* (Bearer Token)"| Router
    Router --> Middleware --> Controllers --> Services --> Prisma --> Database
```

---

## 2. Database Entity-Relationship Diagram (ERD)

The database schema manages relationships across **Users**, **Multi-Vendor Products**, **Taxonomy Categories**, **Shopping Carts**, **Orders**, and **Product Reviews**.

```mermaid
erDiagram
    USER ||--o{ PRODUCT : "sells (as Vendor)"
    USER ||--o| CART : "owns (as Customer)"
    USER ||--o{ ORDER : "places (as Customer)"
    USER ||--o{ REVIEW : "writes"

    CATEGORY ||--o{ PRODUCT : "classifies"
    PRODUCT ||--o{ PRODUCT_IMAGE : "contains"
    PRODUCT ||--o{ CART_ITEM : "referenced in"
    PRODUCT ||--o{ ORDER_ITEM : "purchased in"
    PRODUCT ||--o{ REVIEW : "receives"

    CART ||--o{ CART_ITEM : "contains"
    ORDER ||--o{ ORDER_ITEM : "contains"

    USER {
        int id PK "Auto Increment"
        string name "Full Name"
        string email "Unique Email Address"
        string password "Bcrypt Hashed"
        enum role "CUSTOMER | VENDOR | ADMIN"
        boolean vendorRequest "Pending seller approval flag"
        datetime createdAt "Timestamp"
    }

    CATEGORY {
        int id PK "Auto Increment"
        string name "Category Display Name"
        string slug "Unique URL Slug"
        datetime createdAt "Timestamp"
    }

    PRODUCT {
        int id PK "Auto Increment"
        string name "Product Title"
        string description "Detailed Markdown/Text"
        decimal price "Precision 10,2"
        int stock "Available inventory units"
        string imageUrl "Main primary thumbnail URL"
        enum status "ACTIVE | OUT_OF_STOCK | DRAFT | ARCHIVED"
        boolean deleted "Soft delete flag"
        datetime deletedAt "Timestamp of deletion"
        int vendorId FK "References USER.id"
        int categoryId FK "References CATEGORY.id"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    PRODUCT_IMAGE {
        int id PK "Auto Increment"
        string url "CDN Image URL"
        int productId FK "References PRODUCT.id (Cascade Delete)"
        datetime createdAt "Timestamp"
    }

    CART {
        int id PK "Auto Increment"
        int userId FK "Unique References USER.id"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    CART_ITEM {
        int id PK "Auto Increment"
        int cartId FK "References CART.id (Cascade Delete)"
        int productId FK "References PRODUCT.id"
        int quantity "Item Quantity (min 1)"
    }

    ORDER {
        int id PK "Auto Increment"
        int userId FK "References USER.id"
        decimal totalAmount "Precision 10,2"
        enum status "PENDING | CONFIRMED | SHIPPED | DELIVERED | CANCELLED"
        datetime createdAt "Timestamp"
        datetime updatedAt "Timestamp"
    }

    ORDER_ITEM {
        int id PK "Auto Increment"
        int orderId FK "References ORDER.id"
        int productId FK "References PRODUCT.id"
        int quantity "Units purchased"
        decimal price "Historical unit price at purchase"
    }

    REVIEW {
        int id PK "Auto Increment"
        int productId FK "References PRODUCT.id"
        int userId FK "References USER.id"
        int rating "1 to 5 Stars"
        string title "Review Headline"
        string comment "Feedback description"
        datetime createdAt "Timestamp"
    }
```

---

## 3. Data Flow Diagrams (DFD)

### 3.1 Authentication & Role-Based Access Control (RBAC)

```mermaid
sequenceDiagram
    autonumber
    actor Client as User / Browser
    participant AuthContext as Auth Context (React)
    participant AuthAPI as /api/auth
    participant AuthController as Auth Controller (Node.js)
    participant DB as Database (Prisma)

    Client->>AuthContext: Enter credentials (email, password)
    AuthContext->>AuthAPI: POST /api/auth/login { email, password }
    AuthAPI->>AuthController: Validate payload (Zod Schema)
    AuthController->>DB: prisma.user.findUnique({ email })
    DB-->>AuthController: User Record with Role (CUSTOMER / VENDOR / ADMIN)
    AuthController->>AuthController: Verify password (bcrypt.compare)
    AuthController->>AuthController: Sign JWT with payload { id, role }
    AuthController-->>AuthAPI: 200 OK { token, user: { id, name, role } }
    AuthAPI-->>AuthContext: Store token in localStorage & update state
    AuthContext-->>Client: Redirect to Storefront, Vendor Hub, or Admin Console
```

---

### 3.2 Customer Shopping, Cart & Order Placement Flow

This flow illustrates the transactional journey from catalog browsing to inventory reservation and order fulfillment:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant UI as Storefront UI (/products, /cart, /checkout)
    participant CartAPI as /api/cart
    participant OrderAPI as /api/orders
    participant OrderCtrl as Order Controller (Node.js)
    participant InventorySvc as Inventory Service
    participant DB as Database (Prisma)

    Customer->>UI: Filter catalog (category, price, rating)
    UI->>UI: Update URL Query Params (?category=audio&sort=price_asc)
    Customer->>UI: Click "Add to Cart"
    UI->>CartAPI: POST /api/cart/items { productId, quantity }
    CartAPI->>DB: Upsert into CartItem table
    DB-->>UI: Return updated cart items count
    
    Customer->>UI: Navigate to /checkout & Submit Shipping + Payment
    UI->>OrderAPI: POST /api/orders { shippingAddress, paymentMethod }
    OrderAPI->>OrderCtrl: Begin Atomic Prisma $transaction
    OrderCtrl->>InventorySvc: reserveStock(productId, quantity)
    
    alt Stock Available
        InventorySvc->>DB: Deduct stock from Product table
        OrderCtrl->>DB: Insert record into Order table (status: PENDING)
        OrderCtrl->>DB: Insert item records into OrderItem table
        OrderCtrl->>DB: Delete items from Cart
        OrderCtrl-->>OrderAPI: Transaction Committed (201 Created)
        OrderAPI-->>UI: { success: true, order: { id, status: "PENDING" } }
        UI-->>Customer: Display Order Details & OrderStatusTimeline
    else Insufficient Inventory
        InventorySvc-->>OrderCtrl: Throw AppError("Insufficient stock")
        OrderCtrl-->>UI: 400 Bad Request ("Out of stock")
        UI-->>Customer: Display Toast Error alert
    end
```

---

### 3.3 Vendor Onboarding & Product Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as Customer / Merchant
    participant Admin as Platform Administrator
    participant VendorAPI as /api/vendor
    participant ProductAPI as /api/products
    participant DB as Database (Prisma)

    User->>VendorAPI: POST /api/vendor/apply (Auth: Customer)
    VendorAPI->>DB: Update User set vendorRequest = true
    DB-->>User: 200 OK ("Application submitted")
    
    Admin->>VendorAPI: GET /api/vendor/requests (Auth: Admin)
    VendorAPI->>DB: Find users where vendorRequest = true
    DB-->>Admin: List of pending applicants
    
    Admin->>VendorAPI: PATCH /api/vendor/approve/:id
    VendorAPI->>DB: Update User role = "VENDOR", vendorRequest = false
    DB-->>Admin: 200 OK ("Vendor approved")

    Note over User,DB: Vendor now has access to Vendor Dashboard (/vendor)

    User->>ProductAPI: POST /api/products { name, price, stock, categoryId, images }
    ProductAPI->>DB: Create Product with vendorId = req.user.id
    DB-->>ProductAPI: Product Created (status: ACTIVE)
    ProductAPI-->>User: Reflect in Vendor Inventory Table
```

---

## 4. Lifecycle State Machines

### 4.1 Order Status State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING : Customer places order
    PENDING --> CONFIRMED : Vendor acknowledges & packs parcel
    PENDING --> CANCELLED : Customer cancels before dispatch
    CONFIRMED --> SHIPPED : Carrier picks up shipment (Tracking assigned)
    CONFIRMED --> CANCELLED : Vendor cancels / Out of stock
    SHIPPED --> DELIVERED : Recipient signs & package delivered
    DELIVERED --> [*]
    CANCELLED --> [*]
```

### 4.2 Product Inventory State Machine

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Creator drafts product
    DRAFT --> ACTIVE : Merchant publishes to storefront
    ACTIVE --> OUT_OF_STOCK : Stock reaches 0 via purchases
    OUT_OF_STOCK --> ACTIVE : Merchant restocks inventory
    ACTIVE --> ARCHIVED : Merchant or Admin deletes listing
    OUT_OF_STOCK --> ARCHIVED : Item discontinued
    ARCHIVED --> [*]
```

---

## 5. Summary Table of API Data Contracts

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Customer or Vendor account |
| `POST` | `/api/auth/login` | Public | Authenticate and retrieve JWT Bearer token |
| `GET` | `/api/auth/me` | Logged In | Retrieve current user profile and role |
| `GET` | `/api/products` | Public | Query products with search, category, price, sorting & pagination |
| `POST` | `/api/products` | Vendor, Admin | Create a new product listing linked to the authenticated vendor |
| `PUT` | `/api/products/:id` | Vendor (Owner), Admin | Update product specifications, inventory count, or pricing |
| `DELETE`| `/api/products/:id` | Vendor (Owner), Admin | Soft-delete / archive product from marketplace |
| `GET` | `/api/cart` | Customer | Fetch current shopping bag items and quantities |
| `POST` | `/api/cart/items` | Customer | Add product to bag or increment item quantity |
| `DELETE`| `/api/cart/items/:id`| Customer | Remove item from shopping bag |
| `POST` | `/api/orders` | Customer | Atomically place order, reserve stock, and clear cart |
| `GET` | `/api/orders/my-orders`| Customer | Fetch customer purchase history and order milestones |
| `PATCH` | `/api/orders/:id/status`| Vendor, Admin | Transition order status (`Pending` -> `Confirmed` -> `Shipped` -> `Delivered`) |
| `POST` | `/api/vendor/apply` | Customer | Submit applicant request for vendor merchant privileges |
| `PATCH` | `/api/vendor/approve/:id`| Admin | Approve pending merchant and promote user role to `VENDOR` |
| `GET` | `/api/categories` | Public | Fetch product category taxonomy hierarchy |
| `POST` | `/api/categories` | Admin | Create new product category and slug |
