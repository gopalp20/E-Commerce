const { before, after, test } = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const sharp = require("sharp");
const mediaDirectory = fs.mkdtempSync(
  path.join(require("node:os").tmpdir(), "forme-gallery-tests-"),
);
process.env.MEDIA_DIRECTORY = mediaDirectory;
require("dotenv").config({
  path: path.resolve(__dirname, "../../.env"),
  quiet: true,
});
// Never infer a test target from the shared catalogue connection.
const { testDatabaseUrl } = require("../databaseTarget");
process.env.DATABASE_URL = testDatabaseUrl(
  process.env.DATABASE_URL,
  process.env.TEST_DATABASE_URL,
);
process.env.JWT_SECRET = "forme-test-only-secret";
const prisma = require("../../config/prisma");
const app = require("../../app");
const jwt = require("jsonwebtoken");
let server, base, vendor, category, customer, other;
const prefix = `test-${randomUUID()}`;
const users = [],
  products = [];
async function request(
  route,
  { token, body, method = body ? "POST" : "GET" } = {},
) {
  const response = await fetch(base + "/api" + route, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  return { status: response.status, ...(await response.json()) };
}
async function account(suffix, role = "CUSTOMER") {
  const result = await request("/auth/register", {
    body: {
      name: "Demo Test",
      email: `${prefix}-${suffix}@example.test`,
      password: "TestPassword2026!",
    },
  });
  assert.equal(result.status, 201);
  users.push(result.user.id);
  if (role !== "CUSTOMER")
    await prisma.user.update({ where: { id: result.user.id }, data: { role } });
  return { ...result.user, token: result.token };
}
async function product(stock = 5, price = 1000) {
  const p = await prisma.product.create({
    data: {
      name: `${prefix} Chair ${products.length}`,
      description: "Test product",
      price,
      stock,
      status: "ACTIVE",
      vendorId: vendor.id,
      categoryId: category.id,
      imageUrl: "/images/cup.jpg",
    },
  });
  products.push(p.id);
  return p;
}
async function bag(user, items) {
  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    create: { userId: user.id },
    update: {},
  });
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  for (const [p, quantity] of items)
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: p.id, quantity },
    });
}
const address = {
  name: "Demo Buyer",
  phone: "9876543210",
  line1: "12 Demo Lane",
  line2: "",
  city: "Hyderabad",
  state: "Telangana",
  postalCode: "500001",
  country: "India",
};
const checkout = (total, extra = {}) => ({
  checkoutKey: randomUUID(),
  expectedTotal: total,
  deliveryMethod: "STANDARD",
  shippingAddress: address,
  ...extra,
});
before(async () => {
  execFileSync(
    process.execPath,
    [require.resolve("prisma/build/index.js"), "migrate", "deploy"],
    { cwd: path.resolve(__dirname, "../.."), env: process.env, stdio: "pipe" },
  );
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  vendor = await account("vendor", "VENDOR");
  customer = await account("buyer");
  other = await account("other");
  category = await prisma.category.create({
    data: { name: prefix, slug: prefix },
  });
});
after(async () => {
  if (users.length) {
    await prisma.orderItem.deleteMany({
      where: { order: { userId: { in: users } } },
    });
    await prisma.order.deleteMany({ where: { userId: { in: users } } });
    await prisma.cartItem.deleteMany({
      where: { cart: { userId: { in: users } } },
    });
    await prisma.cart.deleteMany({ where: { userId: { in: users } } });
    await prisma.product.deleteMany({ where: { id: { in: products } } });
    if (category) await prisma.category.delete({ where: { id: category.id } });
    await prisma.user.deleteMany({ where: { id: { in: users } } });
  }
  await prisma.$disconnect();
  if (server) await new Promise((resolve) => server.close(resolve));
  fs.rmSync(mediaDirectory, { recursive: true, force: true });
});

test("Gallery order, cover, descriptions and specifications survive edits without losing photos", async () => {
  const photos = [
    { url: "/images/cup.jpg", alt: "Cup with saucer" },
    { url: "/images/chair.jpg", alt: "Room setting" },
    { url: "/images/lamp.jpg", alt: "Detail" },
  ];
  const created = await request("/products", {
    token: vendor.token,
    body: {
      name: `${prefix} gallery`,
      description: "Gallery fixture",
      price: 890,
      stock: 5,
      categoryId: category.id,
      status: "ACTIVE",
      images: photos,
      specifications: [
        { label: "Material", value: "Stoneware" },
        { label: "Capacity", value: "250 ml" },
      ],
    },
  });
  assert.equal(created.status, 201, JSON.stringify(created));
  const id = created.product.id;
  products.push(id);
  assert.equal(created.product.imageUrl, photos[0].url);
  assert.deepEqual(
    created.product.images.map(({ url, alt }) => ({ url, alt })),
    photos,
  );
  const reordered = [photos[2], photos[0], photos[1]];
  const changed = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { images: reordered },
  });
  assert.equal(changed.status, 200);
  assert.equal(changed.product.imageUrl, photos[2].url);
  assert.deepEqual(
    changed.product.images.map((image) => image.position),
    [0, 1, 2],
  );
  const priceOnly = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { price: 910 },
  });
  assert.equal(priceOnly.status, 200);
  const publicRead = await request(`/products/${id}`);
  assert.deepEqual(
    publicRead.product.images.map(({ url, alt }) => ({ url, alt })),
    reordered,
  );
  assert.equal(publicRead.product.specifications[1].value, "250 ml");
  const legacy = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { images: ["/images/cup.jpg", "/images/lamp.jpg"] },
  });
  assert.equal(legacy.status, 200);
  assert.equal(legacy.product.images.length, 2);
  assert.equal(legacy.product.imageUrl, "/images/cup.jpg");
  const duplicate = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { images: [photos[0], photos[0]] },
  });
  assert.equal(duplicate.status, 400);
  const tooMany = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: {
      images: Array.from({ length: 11 }, (_, i) => `/images/photo-${i}.jpg`),
    },
  });
  assert.equal(tooMany.status, 400);
  const removeAllLive = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { images: [] },
  });
  assert.equal(removeAllLive.status, 400);
  assert.equal((await request(`/products/${id}`)).product.images.length, 2);
  const draft = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { status: "DRAFT", images: [] },
  });
  assert.equal(draft.status, 200);
  assert.equal(draft.product.images.length, 0);
  assert.equal(draft.product.imageUrl, null);
});

test("Sold-out products remain discoverable but cannot be added, and published listings need a photo", async () => {
  const p = await product(0);
  await prisma.product.update({
    where: { id: p.id },
    data: { status: "OUT_OF_STOCK" },
  });
  const listing = await request(
    `/products?search=${encodeURIComponent(p.name)}`,
  );
  assert(listing.products.some((item) => item.id === p.id));
  assert.equal((await request(`/products/${p.id}`)).status, 200);
  assert.equal(
    (
      await request("/cart/items", {
        token: customer.token,
        body: { productId: p.id, quantity: 1 },
      })
    ).status,
    400,
  );
  const noPhoto = await request("/products", {
    token: vendor.token,
    body: {
      name: "Missing photo",
      description: "Not ready",
      stock: 2,
      price: 100,
      categoryId: category.id,
      status: "ACTIVE",
    },
  });
  assert.equal(noPhoto.status, 400);
  for (const body of [
    { price: 2.999 },
    { price: 100000000 },
    { specifications: [{ label: "Material", value: "" }] },
  ]) {
    assert.equal(
      (
        await request(`/products/${p.id}`, {
          method: "PUT",
          token: vendor.token,
          body,
        })
      ).status,
      400,
    );
  }
});

test("Photo uploads validate content and size, persist public WebP files and enforce seller ownership", async () => {
  const png = await sharp({
    create: { width: 2400, height: 1600, channels: 3, background: "#b9b7a7" },
  })
    .png()
    .toBuffer();
  const upload = async (body, type, token) => {
    const response = await fetch(base + "/api/media/images", {
      method: "POST",
      headers: {
        "Content-Type": type,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body,
    });
    return { status: response.status, ...(await response.json()) };
  };
  assert.equal((await upload(png, "image/png")).status, 401);
  assert.equal((await upload(png, "image/png", customer.token)).status, 403);
  assert.equal((await upload(png, "image/jpeg", vendor.token)).status, 400);
  assert.equal(
    (await upload(Buffer.from("not an image"), "image/png", vendor.token))
      .status,
    400,
  );
  assert.equal(
    (
      await upload(
        Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
        "image/png",
        vendor.token,
      )
    ).status,
    400,
  );
  assert.equal(
    (await upload(Buffer.alloc(8 * 1024 * 1024 + 1), "image/png", vendor.token))
      .status,
    413,
  );
  const uploaded = await upload(png, "image/png", vendor.token);
  assert.equal(uploaded.status, 201, JSON.stringify(uploaded));
  assert.equal(uploaded.image.width, 2000);
  const response = await fetch(base + uploaded.image.url);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /image\/webp/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  const meta = await sharp(
    Buffer.from(await response.arrayBuffer()),
  ).metadata();
  assert.equal(meta.format, "webp");
  assert.equal(meta.width, 2000);
  assert.equal(meta.exif, undefined);
  const p = await product();
  const own = await request(`/products/${p.id}`, {
    method: "PUT",
    token: vendor.token,
    body: { images: [{ url: uploaded.image.url, alt: "Uploaded cover" }] },
  });
  assert.equal(own.status, 200);
  assert.equal(
    (await request(`/products/${p.id}`)).product.imageUrl,
    uploaded.image.url,
  );
  const stranger = await account("photo-stranger", "VENDOR");
  const denied = await request("/products", {
    token: stranger.token,
    body: {
      name: "Wrong owner",
      description: "Ownership test",
      price: 10,
      stock: 1,
      categoryId: category.id,
      images: [uploaded.image.url],
    },
  });
  assert.equal(denied.status, 403);
  const editOther = await request(`/products/${p.id}`, {
    token: stranger.token,
    method: "PUT",
    body: { images: [] },
  });
  assert.equal(editOther.status, 403);
});

test("Sellers can find and restore their archived listings as private drafts without losing details", async () => {
  const p = await product(4);
  await request(`/products/${p.id}`, {
    token: vendor.token,
    method: "PUT",
    body: {
      images: [
        { url: "/images/cup.jpg", alt: "Cup and saucer" },
        { url: "/images/lamp.jpg", alt: "Lamp" },
      ],
      specifications: [{ label: "Material", value: "Ceramic" }],
    },
  });
  assert.equal(
    (
      await request(`/products/${p.id}`, {
        token: vendor.token,
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal((await request(`/products/${p.id}`)).status, 404);
  const studio = await request("/products/my-products", {
    token: vendor.token,
  });
  const archived = studio.products.find((item) => item.id === p.id);
  assert.equal(archived.deleted, true);
  const outsider = await account("restore-outsider", "VENDOR");
  assert.equal(
    (
      await request(`/products/${p.id}/restore`, {
        token: outsider.token,
        method: "PATCH",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(`/products/${p.id}/restore`, {
        token: customer.token,
        method: "PATCH",
      })
    ).status,
    403,
  );
  const restored = await request(`/products/${p.id}/restore`, {
    token: vendor.token,
    method: "PATCH",
  });
  assert.equal(restored.status, 200);
  assert.equal(restored.product.deleted, false);
  assert.equal(restored.product.status, "DRAFT");
  assert.equal(restored.product.stock, 4);
  assert.equal(restored.product.images.length, 2);
  assert.equal(restored.product.specifications[0].value, "Ceramic");
  assert.equal((await request(`/products/${p.id}`)).status, 404);
  assert.equal(
    (
      await request(`/products/${p.id}/restore`, {
        token: vendor.token,
        method: "PATCH",
      })
    ).status,
    409,
  );
});
test("Registration hashes passwords, normalises email and cannot request an admin role", async () => {
  const result = await request("/auth/register", {
    body: {
      name: "Demo Buyer",
      email: `${prefix}-CASE@EXAMPLE.TEST`,
      password: "TestPassword2026!",
      role: "ADMIN",
    },
  });
  assert.equal(result.status, 201);
  users.push(result.user.id);
  assert.equal(result.user.role, "CUSTOMER");
  assert.equal(result.user.email, `${prefix}-case@example.test`);
  const stored = await prisma.user.findUnique({
    where: { id: result.user.id },
  });
  assert.notEqual(stored.password, "TestPassword2026!");
  assert.equal(
    (
      await request("/auth/login", {
        body: {
          email: `${prefix}-CASE@EXAMPLE.TEST`,
          password: "TestPassword2026!",
        },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/auth/login", {
        body: { email: result.user.email, password: "wrong" },
      })
    ).status,
    401,
  );
});
test("Catalogue search is case insensitive and excludes archived products", async () => {
  const p = await product();
  const result = await request(
    `/products?search=${encodeURIComponent(p.name.toUpperCase())}`,
  );
  assert.equal(result.status, 200);
  assert.ok(result.products.some((item) => item.id === p.id));
  await prisma.product.update({
    where: { id: p.id },
    data: { status: "ARCHIVED" },
  });
  assert.equal((await request(`/products/${p.id}`)).status, 404);
});
test("Guest bag merge is repeatable without doubling quantities", async () => {
  const p = await product();
  await bag(customer, []);
  const body = { items: [{ productId: p.id, quantity: 2 }] };
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request("/cart/merge", { token: customer.token, body })).status,
      200,
    );
  const result = await request("/cart", { token: customer.token });
  assert.equal(result.cart.items.length, 1);
  assert.equal(result.cart.items[0].quantity, 2);
});
test("Invalid addresses and changed totals never reserve stock", async () => {
  const p = await product();
  await bag(customer, [[p, 1]]);
  assert.equal(
    (
      await request("/orders", {
        token: customer.token,
        body: checkout(1149, {
          shippingAddress: { ...address, postalCode: "oops" },
        }),
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/orders", { token: customer.token, body: checkout(1) }))
      .status,
    409,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    5,
  );
});
test("Concurrent duplicate checkout produces one order and one reservation", async () => {
  const p = await product();
  await bag(customer, [[p, 2]]);
  const body = checkout(2149);
  const results = await Promise.all([
    request("/orders", { token: customer.token, body }),
    request("/orders", { token: customer.token, body }),
  ]);
  assert.ok(
    results.every((r) => r.status === 201),
    JSON.stringify(results),
  );
  assert.equal(results[0].order.id, results[1].order.id);
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    3,
  );
  assert.equal(
    (await request("/cart", { token: customer.token })).cart.items.length,
    0,
  );
  assert.deepEqual(results[0].order.shippingAddress, address);
  assert.equal(results[0].order.items[0].productName, p.name);
  assert.equal(results[0].order.items[0].price, "1000");
  assert.equal(results[0].order.shippingAmount, "149");
  assert.equal(
    (
      await request("/orders", {
        token: customer.token,
        body: { ...body, deliveryMethod: "EXPRESS" },
      })
    ).status,
    409,
  );
  assert.equal(
    (await request(`/orders/${results[0].order.id}`, { token: other.token }))
      .status,
    404,
  );
});
test("Two buyers competing for the last item cannot oversell", async () => {
  const p = await product(1, 3000);
  await bag(customer, [[p, 1]]);
  await bag(other, [[p, 1]]);
  const results = await Promise.all(
    [customer, other].map((user) =>
      request("/orders", { token: user.token, body: checkout(3000) }),
    ),
  );
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
  const stored = await prisma.product.findUnique({ where: { id: p.id } });
  assert.equal(stored.stock, 0);
  assert.equal(stored.status, "OUT_OF_STOCK");
});
test("Failure on a later cart item rolls back the whole checkout", async () => {
  const first = await product(3),
    unavailable = await product(0);
  await bag(customer, [
    [first, 1],
    [unavailable, 1],
  ]);
  assert.equal(
    (await request("/orders", { token: customer.token, body: checkout(2149) }))
      .status,
    400,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: first.id } })).stock,
    3,
  );
  assert.equal(
    (await request("/cart", { token: customer.token })).cart.items.length,
    2,
  );
});
test("Cancellation, including concurrent retries, restores stock exactly once", async () => {
  const p = await product(2);
  await bag(customer, [[p, 2]]);
  const placed = await request("/orders", {
    token: customer.token,
    body: checkout(2149),
  });
  assert.equal(placed.status, 201);
  const route = `/orders/${placed.order.id}/cancel`;
  const results = await Promise.all([
    request(route, { token: customer.token, method: "PATCH" }),
    request(route, { token: customer.token, method: "PATCH" }),
  ]);
  assert.ok(results.every((r) => r.status === 200));
  assert.equal(
    (await request(route, { token: customer.token, method: "PATCH" })).status,
    200,
  );
  const stored = await prisma.product.findUnique({ where: { id: p.id } });
  assert.equal(stored.stock, 2);
  assert.equal(stored.status, "ACTIVE");
});
test("Express delivery totals and order snapshots survive product edits", async () => {
  const p = await product(5, 3000);
  await bag(customer, [[p, 1]]);
  const placed = await request("/orders", {
    token: customer.token,
    body: checkout(3299, { deliveryMethod: "EXPRESS" }),
  });
  assert.equal(placed.status, 201);
  await prisma.product.update({
    where: { id: p.id },
    data: { name: "Updated title", price: 9999 },
  });
  const saved = await request(`/orders/${placed.order.id}`, {
    token: customer.token,
  });
  assert.equal(saved.order.items[0].productName, p.name);
  assert.equal(saved.order.items[0].price, "3000");
  assert.equal(saved.order.shippingAmount, "299");
});
test("Role checks use the current database role, not stale JWT claims", async () => {
  const forgedRole = jwt.sign(
    { id: customer.id, role: "ADMIN" },
    process.env.JWT_SECRET,
  );
  assert.equal(
    (await request("/admin/stats", { token: forgedRole })).status,
    403,
  );
  assert.equal(
    (await request("/orders", { token: vendor.token, body: checkout(1149) }))
      .status,
    403,
  );
});

test("Unavailable guest items fail atomically and leave the account bag intact", async () => {
  const saved = await product(),
    available = await product(),
    missing = await product(0);
  await bag(customer, [[saved, 1]]);
  const result = await request("/cart/merge", {
    token: customer.token,
    body: {
      items: [
        { productId: available.id, quantity: 1 },
        { productId: missing.id, quantity: 1 },
      ],
    },
  });
  assert.equal(result.status, 409);
  const cart = await request("/cart", { token: customer.token });
  assert.deepEqual(
    cart.cart.items.map((item) => item.productId),
    [saved.id],
  );
});
test("Fulfilment enforces transitions, order ownership and cancellation boundaries", async () => {
  const p = await product();
  await bag(customer, [[p, 1]]);
  const placed = await request("/orders", {
    token: customer.token,
    body: checkout(1149),
  });
  const route = `/orders/${placed.order.id}`;
  assert.equal(
    (await request(route + "/cancel", { token: other.token, method: "PATCH" }))
      .status,
    404,
  );
  assert.equal(
    (
      await request(route + "/status", {
        token: vendor.token,
        method: "PATCH",
        body: { status: "DELIVERED" },
      })
    ).status,
    400,
  );
  for (const status of ["CONFIRMED", "SHIPPED", "DELIVERED"])
    assert.equal(
      (
        await request(route + "/status", {
          token: vendor.token,
          method: "PATCH",
          body: { status },
        })
      ).status,
      200,
    );
  assert.equal(
    (
      await request(route + "/cancel", {
        token: customer.token,
        method: "PATCH",
      })
    ).status,
    400,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    4,
  );
});
test("Multi-vendor orders can only be fulfilled by an administrator", async () => {
  const secondVendor = await account("second-vendor", "VENDOR");
  const admin = await account("admin", "ADMIN");
  const first = await product(),
    second = await product();
  await prisma.product.update({
    where: { id: second.id },
    data: { vendorId: secondVendor.id },
  });
  await bag(customer, [
    [first, 1],
    [second, 1],
  ]);
  const placed = await request("/orders", {
    token: customer.token,
    body: checkout(2149),
  });
  const vendorView = (
    await request("/orders/vendor", { token: vendor.token })
  ).orders.find((order) => order.id === placed.order.id);
  assert.equal(vendorView.canManageStatus, false);
  assert.equal(vendorView.items.length, 1);
  assert.equal(vendorView.items[0].productId, first.id);
  assert.equal(
    (
      await request(`/orders/${placed.order.id}/status`, {
        token: vendor.token,
        method: "PATCH",
        body: { status: "CONFIRMED" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(`/admin/orders/${placed.order.id}/status`, {
        token: admin.token,
        method: "PATCH",
        body: { status: "CONFIRMED" },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(`/orders/${placed.order.id}/cancel`, {
        token: customer.token,
        method: "PATCH",
      })
    ).status,
    200,
  );
});

test("Address book validates input, enforces ownership and keeps exactly one default", async () => {
  const buyer = await account("address-owner");
  assert.equal((await request("/addresses")).status, 401);
  assert.equal(
    (await request("/addresses", { token: vendor.token })).status,
    403,
  );
  assert.equal(
    (
      await request("/addresses", {
        token: buyer.token,
        body: { ...address, postalCode: "oops" },
      })
    ).status,
    400,
  );
  const first = await request("/addresses", {
    token: buyer.token,
    body: { ...address, label: "Home" },
  });
  assert.equal(first.status, 201);
  assert.equal(first.address.isDefault, true);
  const second = await request("/addresses", {
    token: buyer.token,
    body: { ...address, label: "Work" },
  });
  assert.equal(second.address.isDefault, false);
  for (const [route, method, body] of [
    [
      `/addresses/${first.address.id}`,
      "PUT",
      { ...address, label: "Intruder" },
    ],
    [`/addresses/${first.address.id}`, "DELETE"],
    [`/addresses/${first.address.id}/default`, "PATCH"],
  ])
    assert.equal(
      (await request(route, { token: other.token, method, body })).status,
      404,
    );
  assert.ok(
    !(await request("/addresses", { token: other.token })).addresses.some(
      (a) => a.id === first.address.id,
    ),
  );
  const changes = await Promise.all(
    [first, second].map((item) =>
      request(`/addresses/${item.address.id}/default`, {
        token: buyer.token,
        method: "PATCH",
      }),
    ),
  );
  assert.ok(
    changes.every((r) => r.status === 200),
    JSON.stringify(changes),
  );
  let list = (await request("/addresses", { token: buyer.token })).addresses;
  assert.equal(list.filter((a) => a.isDefault).length, 1);
  const current = list.find((a) => a.isDefault);
  assert.equal(
    (
      await request(`/addresses/${current.id}`, {
        token: buyer.token,
        method: "PUT",
        body: { ...address, label: "Updated", line1: "24 Updated Lane" },
      })
    ).address.line1,
    "24 Updated Lane",
  );
  assert.equal(
    (
      await request(`/addresses/${current.id}`, {
        token: buyer.token,
        method: "DELETE",
      })
    ).status,
    200,
  );
  list = (await request("/addresses", { token: buyer.token })).addresses;
  assert.equal(list.length, 1);
  assert.equal(list[0].isDefault, true);
});

test("Saved-address checkout rejects another customer's address and preserves its own delivery snapshot", async () => {
  const buyer = await account("saved-checkout");
  const saved = await request("/addresses", {
    token: buyer.token,
    body: address,
  });
  const p = await product();
  await bag(other, [[p, 1]]);
  assert.equal(
    (
      await request("/orders", {
        token: other.token,
        body: checkout(1149, {
          shippingAddress: undefined,
          addressId: saved.address.id,
        }),
      })
    ).status,
    404,
  );
  await bag(buyer, [[p, 1]]);
  const body = checkout(1149, {
    shippingAddress: undefined,
    addressId: saved.address.id,
  });
  const placed = await request("/orders", { token: buyer.token, body });
  assert.equal(placed.status, 201, JSON.stringify(placed));
  assert.deepEqual(placed.order.shippingAddress, address);
  await request(`/addresses/${saved.address.id}`, {
    token: buyer.token,
    method: "PUT",
    body: { ...address, line1: "Changed after ordering" },
  });
  await request(`/addresses/${saved.address.id}`, {
    token: buyer.token,
    method: "DELETE",
  });
  const read = await request(`/orders/${placed.order.id}`, {
    token: buyer.token,
  });
  assert.deepEqual(read.order.shippingAddress, address);
  const retry = await request("/orders", { token: buyer.token, body });
  assert.equal(retry.order.id, placed.order.id);
});

test("Saving an address at checkout is atomic and duplicate submissions save only once", async () => {
  const buyer = await account("save-at-checkout");
  const p = await product();
  await bag(buyer, [[p, 1]]);
  const body = checkout(1149, { saveAddress: true, addressLabel: "Home" });
  const results = await Promise.all([
    request("/orders", { token: buyer.token, body }),
    request("/orders", { token: buyer.token, body }),
  ]);
  assert.ok(
    results.every((r) => r.status === 201),
    JSON.stringify(results),
  );
  assert.equal(results[0].order.id, results[1].order.id);
  assert.equal(
    (await request("/addresses", { token: buyer.token })).addresses.length,
    1,
  );
  await bag(buyer, [[p, 10]]);
  assert.equal(
    (
      await request("/orders", {
        token: buyer.token,
        body: checkout(10000, {
          saveAddress: true,
          addressLabel: "Never saved",
        }),
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/addresses", { token: buyer.token })).addresses.length,
    1,
  );
});

test("Category discovery includes newly created and renamed categories with live product counts", async () => {
  const admin = await account("category-admin", "ADMIN");
  const created = await request("/categories", {
    token: admin.token,
    body: { name: "A new category", slug: `${prefix}-dynamic` },
  });
  assert.equal(created.status, 201);
  try {
    let found = (await request("/categories")).categories.find(
      (c) => c.id === created.category.id,
    );
    assert.equal(found.name, "A new category");
    assert.equal(found._count.products, 0);
    assert.equal(found.imageUrl, null);
    await request(`/categories/${found.id}`, {
      token: admin.token,
      method: "PUT",
      body: { name: "Renamed category", slug: `${prefix}-dynamic` },
    });
    found = (await request("/categories")).categories.find(
      (c) => c.id === found.id,
    );
    assert.equal(found.name, "Renamed category");
    const duplicate = await request(`/categories/${found.id}`, {
      token: admin.token,
      method: "PUT",
      body: { name: "Duplicate", slug: category.slug },
    });
    assert.equal(duplicate.status, 409);
    const inUse = await request(`/categories/${category.id}`, {
      token: admin.token,
      method: "DELETE",
    });
    assert.equal(inUse.status, 409);
    assert.match(inUse.message, /Move this category/);
  } finally {
    await request(`/categories/${created.category.id}`, {
      token: admin.token,
      method: "DELETE",
    });
  }
});

test("Checkout snapshots an image stored in the product gallery", async () => {
  const buyer = await account("gallery-checkout");
  const p = await product();
  await prisma.product.update({
    where: { id: p.id },
    data: { imageUrl: null, images: { create: { url: "/images/cup.jpg" } } },
  });
  await bag(buyer, [[p, 1]]);
  const placed = await request("/orders", {
    token: buyer.token,
    body: checkout(1149),
  });
  assert.equal(placed.status, 201, JSON.stringify(placed));
  assert.equal(placed.order.items[0].productImage, "/images/cup.jpg");
});

test("Seller drafts stay private through edits and restocks until published", async () => {
  const created = await request("/products", {
    token: vendor.token,
    body: {
      name: `${prefix} draft`,
      description: "Private draft",
      price: 250,
      stock: 0,
      categoryId: category.id,
      status: "DRAFT",
    },
  });
  assert.equal(created.status, 201);
  const id = created.product.id;
  products.push(id);
  assert.equal(created.product.status, "DRAFT");
  assert.equal((await request(`/products/${id}`)).status, 404);
  const own = await request("/products/my-products", { token: vendor.token });
  assert.equal(own.products.find((p) => p.id === id).status, "DRAFT");
  const edited = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { price: 260, stock: 4 },
  });
  assert.equal(edited.product.status, "DRAFT");
  assert.equal(edited.product.price, "260");
  const restocked = await request(`/products/${id}/stock`, {
    token: vendor.token,
    method: "PATCH",
    body: { quantity: 2 },
  });
  assert.equal(restocked.status, 200, JSON.stringify(restocked));
  assert.equal(restocked.product.stock, 6);
  assert.equal(restocked.product.status, "DRAFT");
  const published = await request(`/products/${id}`, {
    token: vendor.token,
    method: "PUT",
    body: { status: "ACTIVE", images: ["/images/cup.jpg"] },
  });
  assert.equal(published.product.status, "ACTIVE");
  assert.equal((await request(`/products/${id}`)).status, 200);
});

test("Authentication rejects duplicates, expired tokens and role-only routes without leaking passwords", async () => {
  const duplicate = await request("/auth/register", {
    body: {
      name: "Duplicate",
      email: customer.email,
      password: "TestPassword2026!",
    },
  });
  assert.equal(duplicate.status, 409);
  assert.equal((await request("/auth/me")).status, 401);
  assert.equal((await request("/auth/me", { token: "invalid" })).status, 401);
  const expired = jwt.sign(
    { id: customer.id, role: "CUSTOMER" },
    process.env.JWT_SECRET,
    { expiresIn: -1 },
  );
  assert.equal((await request("/auth/me", { token: expired })).status, 401);
  const profile = await request("/auth/me", { token: customer.token });
  assert.equal(profile.user.id, customer.id);
  assert.equal(profile.user.password, undefined);
  const claims = jwt.decode(customer.token);
  assert.equal(claims.exp - claims.iat, 7 * 24 * 60 * 60);
  for (const route of [
    "/admin/stats",
    "/admin/users",
    "/admin/products",
    "/admin/orders",
    "/vendor/requests",
    "/products/my-products",
    "/orders/vendor",
  ]) {
    assert.equal(
      (await request(route, { token: customer.token })).status,
      403,
      route,
    );
    assert.equal((await request(route)).status, 401, route);
  }
});

test("Vendor application, admin approval, user search and role changes work end to end", async () => {
  const applicant = await account("applicant");
  const admin = await account("approval-admin", "ADMIN");
  assert.equal(
    (await request("/vendor/apply", { token: applicant.token, body: {} }))
      .status,
    200,
  );
  assert.equal(
    (await request("/vendor/apply", { token: applicant.token, body: {} }))
      .status,
    400,
  );
  assert.equal(
    (await request("/vendor/apply", { token: vendor.token, body: {} })).status,
    400,
  );
  const queue = await request("/vendor/requests", { token: admin.token });
  assert.ok(queue.requests.some((u) => u.id === applicant.id));
  const approval = await request(`/vendor/approve/${applicant.id}`, {
    token: admin.token,
    method: "PATCH",
  });
  assert.equal(approval.status, 200);
  assert.equal(
    approval.user.password,
    undefined,
    "Approval must not expose a password hash",
  );
  assert.equal(approval.user.role, "VENDOR");
  assert.equal(
    (await request("/auth/me", { token: applicant.token })).user.role,
    "VENDOR",
  );
  assert.equal(
    (await request("/products/my-products", { token: applicant.token })).status,
    200,
  );
  assert.equal(
    (await request("/cart", { token: applicant.token })).status,
    403,
  );
  assert.equal(
    (
      await request(`/vendor/approve/${applicant.id}`, {
        token: admin.token,
        method: "PATCH",
      })
    ).status,
    400,
  );
  const found = await request(
    `/admin/users?role=VENDOR&search=${encodeURIComponent(applicant.email.toUpperCase())}`,
    { token: admin.token },
  );
  assert.deepEqual(
    found.users.map((u) => u.id),
    [applicant.id],
  );
  assert.equal(found.users[0].password, undefined);
  const changed = await request(`/admin/users/${applicant.id}/role`, {
    token: admin.token,
    method: "PATCH",
    body: { role: "CUSTOMER" },
  });
  assert.equal(changed.user.role, "CUSTOMER");
  assert.equal(
    (await request("/products/my-products", { token: applicant.token })).status,
    403,
  );
  assert.equal(
    (
      await request(`/admin/users/${admin.id}/role`, {
        token: admin.token,
        method: "PATCH",
        body: { role: "CUSTOMER" },
      })
    ).status,
    400,
  );
});

test("Public catalogue combines description search, category, prices, ordering and pagination", async () => {
  const marker = `${prefix} catalogue-matrix`;
  const ids = [];
  for (let i = 0; i < 5; i++) {
    const p = await product(4, 100 + i * 100);
    await prisma.product.update({
      where: { id: p.id },
      data: { description: marker, name: `Audit ${i}` },
    });
    ids.push(p.id);
  }
  const query = `/products?search=${encodeURIComponent(marker.toUpperCase())}&category=${category.slug}&minPrice=200&maxPrice=400&sort=price_desc&limit=2`;
  const first = await request(query);
  assert.equal(first.status, 200);
  assert.deepEqual(
    first.products.map((p) => Number(p.price)),
    [400, 300],
  );
  const second = await request(query + "&page=2");
  assert.deepEqual(
    second.products.map((p) => Number(p.price)),
    [200],
  );
  assert.equal((await request(query + "&page=3")).products.length, 0);
  for (const sort of [
    "oldest",
    "newest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
  ]) {
    assert.equal(
      (
        await request(
          `/products?search=${encodeURIComponent(marker)}&sort=${sort}`,
        )
      ).products.length,
      5,
    );
  }
  for (const invalid of [
    "page=0",
    "limit=101",
    "sort=unknown",
    "minPrice=500&maxPrice=100",
  ])
    assert.equal((await request("/products?" + invalid)).status, 400);
});

test("Category CRUD enforces admin permissions, unique slugs and references including archived products", async () => {
  const admin = await account("category-crud-admin", "ADMIN");
  const body = { name: "Audit category", slug: `${prefix}-crud` };
  assert.equal(
    (await request("/categories", { token: vendor.token, body })).status,
    403,
  );
  const created = await request("/categories", { token: admin.token, body });
  assert.equal(created.status, 201);
  const id = created.category.id;
  try {
    assert.equal(
      (await request("/categories", { token: admin.token, body })).status,
      409,
    );
    assert.equal((await request(`/categories/${id}`)).category.slug, body.slug);
    assert.equal(
      (
        await request(`/categories/${id}`, {
          method: "PUT",
          token: admin.token,
          body: { ...body, name: "Renamed category" },
        })
      ).category.name,
      "Renamed category",
    );
    assert.equal(
      (
        await request(`/categories/${id}`, {
          method: "PUT",
          token: admin.token,
          body: { ...body, slug: category.slug },
        })
      ).status,
      409,
    );
    const p = await product();
    await prisma.product.update({
      where: { id: p.id },
      data: { categoryId: id, deleted: true, status: "ARCHIVED" },
    });
    assert.equal(
      (
        await request(`/categories/${id}`, {
          method: "DELETE",
          token: admin.token,
        })
      ).status,
      409,
    );
    await prisma.product.update({
      where: { id: p.id },
      data: { categoryId: category.id },
    });
    assert.equal(
      (
        await request(`/categories/${id}`, {
          method: "DELETE",
          token: admin.token,
        })
      ).status,
      200,
    );
    assert.equal((await request(`/categories/${id}`)).status, 404);
  } finally {
    await prisma.category.deleteMany({ where: { id } });
  }
});

test("Cart add, cumulative stock limits, quantity edit, ownership, removal and clear persist", async () => {
  const p = await product(3);
  await bag(customer, []);
  assert.equal(
    (
      await request("/cart/items", {
        token: customer.token,
        body: { productId: p.id, quantity: 1 },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/cart/items", {
        token: customer.token,
        body: { productId: p.id, quantity: 2 },
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/cart/items", {
        token: customer.token,
        body: { productId: p.id, quantity: 1 },
      })
    ).status,
    400,
  );
  const item = (await request("/cart", { token: customer.token })).cart
    .items[0];
  assert.equal(item.quantity, 3);
  for (const method of ["PUT", "DELETE"])
    assert.equal(
      (
        await request(`/cart/items/${item.id}`, {
          token: other.token,
          method,
          ...(method === "PUT" && { body: { quantity: 1 } }),
        })
      ).status,
      404,
    );
  assert.equal(
    (
      await request(`/cart/items/${item.id}`, {
        token: customer.token,
        method: "PUT",
        body: { quantity: 0 },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(`/cart/items/${item.id}`, {
        token: customer.token,
        method: "PUT",
        body: { quantity: 2 },
      })
    ).cartItem.quantity,
    2,
  );
  assert.equal(
    (
      await request(`/cart/items/${item.id}`, {
        token: customer.token,
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request("/cart", { token: customer.token })).cart.items.length,
    0,
  );
  await bag(customer, [[p, 1]]);
  assert.equal(
    (await request("/cart", { token: customer.token, method: "DELETE" }))
      .status,
    200,
  );
  assert.equal(
    (await request("/cart", { token: customer.token })).cart.items.length,
    0,
  );
  assert.equal(
    (await request("/cart", { token: customer.token, method: "DELETE" }))
      .status,
    200,
  );
});

test("Concurrent add-to-cart requests preserve both additions without duplicate rows", async () => {
  const p = await product(5);
  await bag(customer, []);
  const results = await Promise.all(
    [1, 2].map(() =>
      request("/cart/items", {
        token: customer.token,
        body: { productId: p.id, quantity: 1 },
      }),
    ),
  );
  assert.ok(
    results.every((r) => r.status === 200),
    JSON.stringify(results),
  );
  const items = (await request("/cart", { token: customer.token })).cart.items;
  assert.equal(items.length, 1);
  assert.equal(items[0].quantity, 2);
});

test("Seller ownership, sold-out inventory, restock and admin edits are enforced", async () => {
  const secondVendor = await account("ownership-vendor", "VENDOR");
  const admin = await account("product-admin", "ADMIN");
  const p = await product(0);
  await prisma.product.update({
    where: { id: p.id },
    data: { status: "OUT_OF_STOCK" },
  });
  const list = await request("/products/my-products/out-of-stock", {
    token: vendor.token,
  });
  assert.ok(list.products.some((item) => item.id === p.id));
  assert.equal(
    (await request("/products/my-products", { token: secondVendor.token }))
      .products.length,
    0,
  );
  for (const method of ["PUT", "DELETE"])
    assert.equal(
      (
        await request(`/products/${p.id}`, {
          token: secondVendor.token,
          method,
          ...(method === "PUT" && { body: { price: 9 } }),
        })
      ).status,
      403,
    );
  assert.equal(
    (
      await request(`/products/${p.id}/stock`, {
        token: secondVendor.token,
        method: "PATCH",
        body: { quantity: 3 },
      })
    ).status,
    404,
  );
  const restocked = await request(`/products/${p.id}/stock`, {
    token: vendor.token,
    method: "PATCH",
    body: { quantity: 3 },
  });
  assert.equal(restocked.product.stock, 3);
  assert.equal(restocked.product.status, "ACTIVE");
  const edit = await request(`/products/${p.id}`, {
    token: admin.token,
    method: "PUT",
    body: { price: 1290, name: `${prefix} Admin edited` },
  });
  assert.equal(edit.status, 200);
  assert.equal((await request(`/products/${p.id}`)).product.price, "1290");
  assert.equal(
    (
      await request(`/products/${p.id}`, {
        token: admin.token,
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal((await request(`/products/${p.id}`)).status, 404);
});

test("Admin counts and non-cancelled order value match saved records", async () => {
  const admin = await account("stats-admin", "ADMIN");
  const result = await request("/admin/stats", { token: admin.token });
  assert.equal(result.status, 200);
  assert.equal(result.stats.totalUsers, await prisma.user.count());
  assert.equal(
    result.stats.totalVendors,
    await prisma.user.count({ where: { role: "VENDOR" } }),
  );
  assert.equal(
    result.stats.totalProducts,
    await prisma.product.count({ where: { deleted: false } }),
  );
  assert.equal(result.stats.totalCategories, await prisma.category.count());
  assert.equal(result.stats.totalOrders, await prisma.order.count());
  const sum = await prisma.order.aggregate({
    where: { status: { not: "CANCELLED" } },
    _sum: { totalAmount: true },
  });
  assert.equal(
    Number(result.stats.totalRevenue),
    Number(sum._sum.totalAmount || 0),
  );
  const orders = await request("/admin/orders", { token: admin.token });
  assert.equal(orders.orders.length, result.stats.totalOrders);
});

test("Admin vendor filters scope products and orders while retaining full mixed-order details", async () => {
  const admin = await account("filter-admin", "ADMIN");
  const seller = await account("filter-seller", "VENDOR");
  const buyer = await account("filter-buyer");
  const a = await product(4, 500),
    b = await product(4, 700);
  await prisma.product.update({
    where: { id: b.id },
    data: { vendorId: seller.id },
  });
  await bag(buyer, [
    [a, 1],
    [b, 2],
  ]);
  const order = await request("/orders", {
    token: buyer.token,
    body: checkout(2049),
  });
  assert.equal(order.status, 201);
  const filteredProducts = await request(
    `/admin/products?vendorId=${seller.id}`,
    { token: admin.token },
  );
  assert.deepEqual(
    filteredProducts.products.map((p) => p.id),
    [b.id],
  );
  const filteredOrders = await request(`/admin/orders?vendorId=${seller.id}`, {
    token: admin.token,
  });
  assert.deepEqual(
    filteredOrders.orders.map((o) => o.id),
    [order.order.id],
  );
  assert.equal(
    filteredOrders.orders[0].items.length,
    2,
    "Admin must retain the complete mixed-vendor order",
  );
  assert.deepEqual(
    new Set(filteredOrders.orders[0].items.map((i) => i.product.vendorId)),
    new Set([vendor.id, seller.id]),
  );
  for (const route of ["/admin/products", "/admin/orders"]) {
    assert.equal(
      (await request(route + "?vendorId=-1", { token: admin.token })).status,
      400,
    );
    assert.equal(
      (
        await request(route + `?vendorId=${seller.id}`, {
          token: customer.token,
        })
      ).status,
      403,
    );
    const empty = await request(route + "?vendorId=2147483647", {
      token: admin.token,
    });
    assert.equal((empty.products || empty.orders).length, 0);
  }
  await prisma.user.update({
    where: { id: seller.id },
    data: { role: "CUSTOMER" },
  });
  const directory = await request("/admin/vendors", { token: admin.token });
  assert.ok(
    directory.vendors.some((v) => v.id === seller.id),
    "Former sellers with listings remain filterable",
  );
  assert.ok(
    directory.vendors.every(
      (v) => Object.keys(v).sort().join(",") === "id,name",
    ),
  );
  assert.equal(
    (await request("/admin/vendors", { token: customer.token })).status,
    403,
  );
});

async function deliveredPurchase(buyer, p) {
  return prisma.order.create({
    data: {
      userId: buyer.id,
      totalAmount: p.price,
      subtotal: p.price,
      status: "DELIVERED",
      items: { create: { productId: p.id, quantity: 1, price: p.price } },
    },
  });
}
const reviewBody = {
  rating: 4,
  title: "Comfortable everyday choice",
  body: "Well made and comfortable to use every day. The finish feels solid.",
};

test("reviews require a delivered purchase, validate content and prevent duplicates", async () => {
  const p = await product(),
    buyer = await account("review-buyer");
  const route = `/reviews/product/${p.id}`;
  assert.equal((await request(route, { body: reviewBody })).status, 401);
  assert.equal(
    (await request(route, { token: vendor.token, body: reviewBody })).status,
    403,
  );
  assert.equal(
    (await request(route, { token: buyer.token, body: reviewBody })).status,
    403,
  );
  await bag(buyer, [[p, 1]]);
  const order = (
    await request("/orders", { token: buyer.token, body: checkout(1149) })
  ).order;
  assert.equal(
    (await request(route, { token: buyer.token, body: reviewBody })).status,
    403,
  );
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "DELIVERED" },
  });
  assert.equal(
    (await request(`${route}/me`, { token: buyer.token })).eligible,
    true,
  );
  for (const invalid of [
    { ...reviewBody, rating: 0 },
    { ...reviewBody, rating: 6 },
    { ...reviewBody, rating: 3.5 },
    { ...reviewBody, body: "short" },
  ])
    assert.equal(
      (await request(route, { token: buyer.token, body: invalid })).status,
      400,
    );
  const created = await request(route, {
    token: buyer.token,
    body: { ...reviewBody, userId: other.id, status: "HIDDEN" },
  });
  assert.equal(created.status, 201);
  assert.equal(created.review.status, "PUBLISHED");
  assert.equal(created.review.isOwn, true);
  assert.equal(
    (await request(route, { token: buyer.token, body: reviewBody })).status,
    409,
  );
  const publicList = await request(route);
  assert.equal(publicList.reviews[0].author, "Demo T.");
  assert.equal(publicList.reviews[0].verifiedPurchase, true);
  for (const field of [
    "userId",
    "user",
    "email",
    "password",
    "votes",
    "moderationReason",
  ])
    assert.equal(publicList.reviews[0][field], undefined);
  assert.equal(publicList.summary.count, 1);
  assert.equal(publicList.summary.average, 4);
  const detail = await request(`/products/${p.id}`);
  assert.equal(detail.product.reviewCount, 1);
  assert.equal(detail.product.ratingAverage, 4);
  const catalogue = await request(
    `/products?search=${encodeURIComponent(p.name)}`,
  );
  assert.equal(catalogue.products.find((x) => x.id === p.id).reviewCount, 1);
});

test("review ownership, helpful votes and deletion stay consistent", async () => {
  const p = await product(),
    author = await account("review-author"),
    voter = await account("review-voter");
  await deliveredPurchase(author, p);
  const { review } = await request(`/reviews/product/${p.id}`, {
    token: author.token,
    body: reviewBody,
  });
  assert.equal(
    (
      await request(`/reviews/${review.id}`, {
        token: voter.token,
        method: "PUT",
        body: { ...reviewBody, rating: 1 },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(`/reviews/${review.id}`, {
        token: voter.token,
        method: "DELETE",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(`/reviews/${review.id}/helpful`, {
        token: author.token,
        method: "PUT",
        body: { helpful: true },
      })
    ).status,
    400,
  );
  const votes = await Promise.all(
    [1, 2].map(() =>
      request(`/reviews/${review.id}/helpful`, {
        token: voter.token,
        method: "PUT",
        body: { helpful: true },
      }),
    ),
  );
  votes.forEach((v) => assert.equal(v.status, 200));
  assert.equal(
    await prisma.reviewVote.count({ where: { reviewId: review.id } }),
    1,
  );
  assert.equal(
    (await request(`/reviews/product/${p.id}`, { token: voter.token }))
      .reviews[0].helpful,
    true,
  );
  assert.equal(
    (
      await request(`/reviews/${review.id}/helpful`, {
        token: voter.token,
        method: "PUT",
        body: { helpful: false },
      })
    ).helpfulCount,
    0,
  );
  const edited = await request(`/reviews/${review.id}`, {
    token: author.token,
    method: "PUT",
    body: { ...reviewBody, rating: 2, title: "Updated after more use" },
  });
  assert.equal(edited.review.rating, 2);
  assert.equal((await request(`/products/${p.id}`)).product.ratingAverage, 2);
  await request(`/reviews/${review.id}/helpful`, {
    token: voter.token,
    method: "PUT",
    body: { helpful: true },
  });
  assert.equal(
    (
      await request(`/reviews/${review.id}`, {
        token: author.token,
        method: "DELETE",
      })
    ).status,
    200,
  );
  assert.equal(
    await prisma.reviewVote.count({ where: { reviewId: review.id } }),
    0,
  );
  assert.equal((await request(`/products/${p.id}`)).product.reviewCount, 0);
  assert.equal(
    (await request(`/reviews/product/${p.id}/me`, { token: author.token }))
      .review,
    null,
  );
});

test("review breakdown, rating filters, stable sort and pagination use published data", async () => {
  const p = await product();
  const ids = [];
  for (const [i, rating] of [5, 1, 4].entries()) {
    const buyer = await account(`review-sort-${i}`);
    await deliveredPurchase(buyer, p);
    ids.push(
      (
        await request(`/reviews/product/${p.id}`, {
          token: buyer.token,
          body: { ...reviewBody, rating },
        })
      ).review.id,
    );
  }
  const list = await request(`/reviews/product/${p.id}?sort=highest&limit=2`);
  assert.deepEqual(
    list.reviews.map((r) => r.rating),
    [5, 4],
  );
  assert.equal(list.pagination.totalPages, 2);
  assert.equal(list.summary.count, 3);
  assert.equal(list.summary.distribution[5], 1);
  assert.equal(list.summary.distribution[2], 0);
  assert.equal(
    (await request(`/reviews/product/${p.id}?sort=highest&limit=2&page=2`))
      .reviews[0].rating,
    1,
  );
  assert.equal(
    (await request(`/reviews/product/${p.id}?sort=lowest`)).reviews[0].rating,
    1,
  );
  const filtered = await request(`/reviews/product/${p.id}?rating=1`);
  assert.equal(filtered.pagination.total, 1);
  assert.equal(filtered.summary.count, 3);
  await request(`/reviews/${ids[0]}/helpful`, {
    token: other.token,
    method: "PUT",
    body: { helpful: true },
  });
  assert.equal(
    (await request(`/reviews/product/${p.id}?sort=helpful`)).reviews[0].id,
    ids[0],
  );
  for (const query of ["rating=6", "page=0", "limit=100", "sort=bad"])
    assert.equal(
      (await request(`/reviews/product/${p.id}?${query}`)).status,
      400,
    );
});

test("admin moderation updates ratings and cannot be bypassed by editing; vendor feedback is scoped", async () => {
  const admin = await account("reviews-admin", "ADMIN"),
    author = await account("moderated-author"),
    secondVendor = await account("review-other-vendor", "VENDOR");
  const p = await product();
  await deliveredPurchase(author, p);
  const { review } = await request(`/reviews/product/${p.id}`, {
    token: author.token,
    body: reviewBody,
  });
  const path = `/reviews/${review.id}/moderation`,
    hidden = {
      status: "HIDDEN",
      reason: "Contains personal contact information.",
    };
  assert.equal(
    (
      await request(path, {
        token: vendor.token,
        method: "PATCH",
        body: hidden,
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(path, {
        token: admin.token,
        method: "PATCH",
        body: { status: "HIDDEN" },
      })
    ).status,
    400,
  );
  assert.equal(
    (await request(path, { token: admin.token, method: "PATCH", body: hidden }))
      .status,
    200,
  );
  assert.equal((await request(`/reviews/product/${p.id}`)).summary.count, 0);
  assert.equal((await request(`/products/${p.id}`)).product.reviewCount, 0);
  assert.equal(
    (
      await request(`/reviews/${review.id}/helpful`, {
        token: other.token,
        method: "PUT",
        body: { helpful: true },
      })
    ).status,
    404,
  );
  assert.equal(
    (await request(`/reviews/product/${p.id}/me`, { token: author.token }))
      .review.moderationReason,
    hidden.reason,
  );
  const edited = await request(`/reviews/${review.id}`, {
    token: author.token,
    method: "PUT",
    body: { ...reviewBody, rating: 5, status: "PUBLISHED" },
  });
  assert.equal(edited.review.status, "HIDDEN");
  assert.equal(
    (
      await request(`/reviews/admin?vendorId=${vendor.id}&status=HIDDEN`, {
        token: admin.token,
      })
    ).reviews.some((r) => r.id === review.id),
    true,
  );
  assert.equal(
    (await request("/reviews/admin", { token: author.token })).status,
    403,
  );
  assert.equal(
    (
      await request(path, {
        token: admin.token,
        method: "PATCH",
        body: { status: "PUBLISHED" },
      })
    ).status,
    200,
  );
  assert.equal((await request(`/products/${p.id}`)).product.ratingAverage, 5);
  assert.equal(
    (await request("/reviews/vendor", { token: vendor.token })).reviews.some(
      (r) => r.id === review.id,
    ),
    true,
  );
  assert.equal(
    (
      await request(`/reviews/vendor?vendorId=${vendor.id}`, {
        token: secondVendor.token,
      })
    ).pagination.total,
    0,
  );
  assert.equal(
    (await request("/reviews/mine", { token: author.token })).reviews.some(
      (r) => r.id === review.id,
    ),
    true,
  );
  assert.equal(
    (await request("/reviews/mine", { token: other.token })).reviews.some(
      (r) => r.id === review.id,
    ),
    false,
  );
  await prisma.product.update({
    where: { id: p.id },
    data: { deleted: true, status: "ARCHIVED" },
  });
  assert.equal((await request(`/reviews/product/${p.id}`)).status, 404);
  assert.equal(
    (await request("/reviews/mine", { token: author.token })).reviews.some(
      (r) => r.id === review.id,
    ),
    true,
  );
});

test("Saved items persist per customer; concurrent saves and removals are repeatable", async () => {
  const buyer = await account("saved-owner"),
    stranger = await account("saved-stranger"),
    p = await product();
  const save = () =>
    request(`/saved/${p.id}`, { token: buyer.token, method: "PUT", body: {} });
  assert.deepEqual(
    (await Promise.all([save(), save(), save()])).map((r) => r.status),
    [200, 200, 200],
  );
  let list = await request("/saved", { token: buyer.token });
  assert.equal(list.items.length, 1);
  assert.equal(list.items[0].quantity, 1);
  assert.equal(list.items[0].product.id, p.id);
  assert.equal(Number(list.items[0].savedPrice), 1000);
  assert.equal(JSON.stringify(list).includes('"password"'), false);
  assert.equal(
    (await request("/saved", { token: stranger.token })).items.length,
    0,
  );
  await request(`/saved/${p.id}`, { token: stranger.token, method: "DELETE" });
  assert.equal(
    (await request("/saved", { token: buyer.token })).items.length,
    1,
  );
  const login = await request("/auth/login", {
    body: { email: buyer.email, password: "TestPassword2026!" },
  });
  assert.equal(
    (await request("/saved", { token: login.token })).items[0].productId,
    p.id,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await request(`/saved/${p.id}`, {
          token: buyer.token,
          method: "DELETE",
        })
      ).status,
      200,
    );
  assert.equal(
    (await request("/saved", { token: buyer.token })).items.length,
    0,
  );
});
test("Saving from the bag transfers the selected quantity atomically and tolerates duplicate requests", async () => {
  const buyer = await account("save-bag"),
    stranger = await account("save-bag-other"),
    p = await product(9);
  await bag(buyer, [[p, 3]]);
  assert.equal(
    (
      await request(`/saved/${p.id}`, {
        token: stranger.token,
        method: "PUT",
        body: { fromBag: true },
      })
    ).status,
    409,
  );
  const save = () =>
    request(`/saved/${p.id}`, {
      token: buyer.token,
      method: "PUT",
      body: { fromBag: true },
    });
  assert.deepEqual(
    (await Promise.all([save(), save()])).map((r) => r.status),
    [200, 200],
  );
  assert.equal(
    (await request("/cart", { token: buyer.token })).cart.items.length,
    0,
  );
  assert.equal(
    (await request("/saved", { token: buyer.token })).items[0].quantity,
    3,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    9,
  );
});
test("Moving saved items to the bag is repeatable and merges without doubling existing quantities", async () => {
  const buyer = await account("saved-move"),
    p = await product(9);
  await request(`/saved/${p.id}`, {
    token: buyer.token,
    method: "PUT",
    body: {},
  });
  await bag(buyer, [[p, 2]]);
  const move = () =>
    request(`/saved/${p.id}/bag`, {
      token: buyer.token,
      body: { quantity: 3, expectedPrice: 1000 },
    });
  assert.deepEqual(
    (await Promise.all([move(), move(), move()])).map((r) => r.status),
    [200, 200, 200],
  );
  assert.equal(
    (await request("/cart", { token: buyer.token })).cart.items[0].quantity,
    3,
  );
  assert.equal(
    (await request("/saved", { token: buyer.token })).items.length,
    0,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    9,
  );
});
test("Changed prices, stock shortages and sold-out products keep saved items intact", async () => {
  const buyer = await account("saved-changes"),
    p = await product(5);
  await request(`/saved/${p.id}`, {
    token: buyer.token,
    method: "PUT",
    body: {},
  });
  await prisma.product.update({
    where: { id: p.id },
    data: { price: 1200, stock: 2 },
  });
  const move = (body) =>
    request(`/saved/${p.id}/bag`, { token: buyer.token, body });
  assert.equal((await move({ quantity: 1, expectedPrice: 1000 })).status, 409);
  assert.equal((await move({ quantity: 3, expectedPrice: 1200 })).status, 409);
  const list = await request("/saved", { token: buyer.token });
  assert.equal(Number(list.items[0].savedPrice), 1000);
  assert.equal(Number(list.items[0].product.price), 1200);
  await prisma.product.update({
    where: { id: p.id },
    data: { stock: 0, status: "OUT_OF_STOCK" },
  });
  assert.equal((await move({ quantity: 1, expectedPrice: 1200 })).status, 409);
  assert.equal(
    (await request("/saved", { token: buyer.token })).items.length,
    1,
  );
  assert.equal(
    (await request("/cart", { token: buyer.token })).cart.items.length,
    0,
  );
  await prisma.product.update({
    where: { id: p.id },
    data: { stock: 3, status: "ACTIVE" },
  });
  assert.equal((await move({ quantity: 2, expectedPrice: 1200 })).status, 200);
});
test("Private and withdrawn listings cannot be saved or leak draft data through old saves", async () => {
  const buyer = await account("saved-private"),
    p = await product();
  await request(`/saved/${p.id}`, {
    token: buyer.token,
    method: "PUT",
    body: {},
  });
  await prisma.product.update({
    where: { id: p.id },
    data: {
      status: "DRAFT",
      name: "Private unreleased name",
      description: "Private description",
      price: 777,
    },
  });
  const list = await request("/saved", { token: buyer.token });
  assert.equal(list.items[0].available, false);
  assert.equal(list.items[0].product.name, p.name);
  assert.equal(list.items[0].product.price, null);
  assert.equal(JSON.stringify(list).includes("Private"), false);
  assert.equal(
    (
      await request(`/saved/${p.id}`, {
        token: buyer.token,
        method: "PUT",
        body: {},
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request(`/saved/${p.id}/bag`, {
        token: buyer.token,
        body: { quantity: 1, expectedPrice: 777 },
      })
    ).status,
    409,
  );
  assert.equal(
    (await request(`/saved/${p.id}`, { token: buyer.token, method: "DELETE" }))
      .status,
    200,
  );
});
test("Saved routes enforce customer roles, ownership, positive IDs and request validation", async () => {
  const buyer = await account("saved-validation"),
    p = await product();
  for (const route of ["/saved", `/saved/${p.id}`]) {
    const method = route === "/saved" ? "GET" : "PUT",
      body = method === "PUT" ? {} : undefined;
    assert.equal((await request(route, { method, body })).status, 401);
    assert.equal(
      (await request(route, { method, body, token: vendor.token })).status,
      403,
    );
  }
  for (const value of ["-1", "1.2", "wat", "2147483648", "9007199254740992"])
    assert.equal(
      (
        await request(`/saved/${value}`, {
          token: buyer.token,
          method: "PUT",
          body: {},
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await request(`/saved/${p.id}`, {
        token: buyer.token,
        method: "PUT",
        body: { userId: customer.id },
      })
    ).status,
    400,
  );
  for (const body of [
    { quantity: 0, expectedPrice: 1000 },
    { quantity: 1.5, expectedPrice: 1000 },
    { quantity: 1 },
    { quantity: 1, expectedPrice: -1 },
  ])
    assert.equal(
      (await request(`/saved/${p.id}/bag`, { token: buyer.token, body }))
        .status,
      400,
    );
  assert.equal(
    (
      await request(`/saved/${p.id}/bag`, {
        token: buyer.token,
        body: { quantity: 1, expectedPrice: 1000 },
      })
    ).status,
    404,
  );
});
test("The saved item limit rejects new saves without removing their bag item", async () => {
  const buyer = await account("saved-cap"),
    p = await product();
  const fixtures = await prisma.product.createManyAndReturn({
    data: Array.from({ length: 200 }, (_, i) => ({
      name: `${prefix} saved limit ${i}`,
      description: "Test",
      price: 100,
      stock: 3,
      status: "ACTIVE",
      vendorId: vendor.id,
      categoryId: category.id,
    })),
  });
  products.push(...fixtures.map((p) => p.id));
  await prisma.savedItem.createMany({
    data: fixtures.map((p) => ({
      userId: buyer.id,
      productId: p.id,
      savedPrice: p.price,
      productName: p.name,
    })),
  });
  await bag(buyer, [[p, 2]]);
  assert.equal(
    (
      await request(`/saved/${p.id}`, {
        token: buyer.token,
        method: "PUT",
        body: { fromBag: true },
      })
    ).status,
    409,
  );
  assert.equal(
    (await request("/cart", { token: buyer.token })).cart.items[0].quantity,
    2,
  );
  assert.equal(
    (
      await request(`/saved/${fixtures[0].id}`, {
        token: buyer.token,
        method: "PUT",
        body: {},
      })
    ).status,
    200,
  );
});
test("Catalogue rating and availability filters combine before paging; hidden reviews never influence them", async () => {
  const marker = `${prefix} discovery`,
    buyer = await account("discovery-review");
  const entries = await Promise.all([
    product(5, 100),
    product(5, 200),
    product(0, 300),
    product(5, 400),
  ]);
  for (let i = 0; i < entries.length; i++) {
    await prisma.product.update({
      where: { id: entries[i].id },
      data: {
        name: `${marker} ${i}`,
        status: i === 2 ? "OUT_OF_STOCK" : "ACTIVE",
      },
    });
    if (i < 3)
      await prisma.review.create({
        data: {
          userId: buyer.id,
          productId: entries[i].id,
          rating: [5, 3, 4][i],
          title: "Test review",
          body: "Isolated fixture",
          status: i === 0 ? "HIDDEN" : "PUBLISHED",
        },
      });
  }
  const query = `/products?search=${encodeURIComponent(marker)}&category=${category.slug}`;
  const ranked = await request(query + "&sort=rating_desc&limit=1");
  assert.equal(ranked.status, 200, JSON.stringify(ranked));
  assert.equal(ranked.products[0].id, entries[2].id);
  assert.equal(ranked.pagination.total, 4);
  assert.equal(
    (await request(query + "&sort=rating_desc&limit=1&page=2")).products[0].id,
    entries[1].id,
  );
  const combined = await request(
    query + "&availability=in_stock&minRating=3&maxPrice=350",
  );
  assert.deepEqual(
    combined.products.map((p) => p.id),
    [entries[1].id],
  );
  assert.equal(
    (await request(query + "&availability=in_stock&minRating=4")).pagination
      .total,
    0,
  );
  assert.equal(
    (await request(query + "&minRating=4")).products[0].id,
    entries[2].id,
  );
});
test("Best-selling uses delivered units, excluding cancelled and pending orders, before pagination", async () => {
  const marker = `${prefix} popular`,
    buyer = await account("popular-buyer");
  const entries = await Promise.all([product(), product(), product()]);
  for (let i = 0; i < entries.length; i++) {
    await prisma.product.update({
      where: { id: entries[i].id },
      data: { name: `${marker} ${i}` },
    });
    for (const [status, quantity] of [
      ["DELIVERED", [2, 7, 0][i]],
      ["CANCELLED", 99],
      ["PENDING", 99],
    ]) {
      if (quantity)
        await prisma.order.create({
          data: {
            userId: buyer.id,
            status,
            totalAmount: quantity * 1000,
            items: {
              create: { productId: entries[i].id, quantity, price: 1000 },
            },
          },
        });
    }
  }
  const query = `/products?search=${encodeURIComponent(marker)}&sort=best_selling&limit=1`;
  assert.equal((await request(query)).products[0].id, entries[1].id);
  assert.equal(
    (await request(query + "&page=2")).products[0].id,
    entries[0].id,
  );
  assert.equal(
    (await request(query + "&page=3")).products[0].id,
    entries[2].id,
  );
});
test("Catalogue new controls validate input and literal wildcard searches do not broaden results", async () => {
  for (const query of [
    "minRating=0",
    "minRating=6",
    "minRating=2.5",
    "availability=maybe",
    "sort=rating_desc;DROP",
  ])
    assert.equal((await request(`/products?${query}`)).status, 400);
  const p = await product();
  await prisma.product.update({
    where: { id: p.id },
    data: { name: `${prefix} 100%_literal` },
  });
  const result = await request(
    `/products?search=${encodeURIComponent(`${prefix} 100%_`)}`,
  );
  assert.deepEqual(
    result.products.map((p) => p.id),
    [p.id],
  );
});

test("Saved item to bag to order preserves totals and cancellation restores stock", async () => {
  const buyer = await account("wishlist-checkout-journey"),
    p = await product(4, 890);
  assert.equal(
    (
      await request(`/saved/${p.id}`, {
        token: buyer.token,
        method: "PUT",
        body: {},
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(`/saved/${p.id}/bag`, {
        token: buyer.token,
        body: { quantity: 2, expectedPrice: 890 },
      })
    ).status,
    200,
  );
  const ordered = await request("/orders", {
    token: buyer.token,
    body: checkout(1929),
  });
  assert.equal(ordered.status, 201, JSON.stringify(ordered));
  assert.equal(Number(ordered.order.totalAmount), 1929);
  assert.equal(ordered.order.items[0].quantity, 2);
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    2,
  );
  assert.equal(
    (await request("/saved", { token: buyer.token })).items.length,
    0,
  );
  assert.equal(
    (await request("/cart", { token: buyer.token })).cart.items.length,
    0,
  );
  assert.equal(
    (
      await request(`/orders/${ordered.order.id}/cancel`, {
        token: buyer.token,
        method: "PATCH",
      })
    ).status,
    200,
  );
  assert.equal(
    (await prisma.product.findUnique({ where: { id: p.id } })).stock,
    4,
  );
});
