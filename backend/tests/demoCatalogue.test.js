const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { catalogue, accounts, categories } = require("../prisma/demoCatalogue");
test("Demo catalogue has forty distinct products, balanced vendors and complete local photo assets", () => {
  assert.equal(catalogue.length, 40);
  assert.equal(new Set(catalogue.map((p) => p.name)).size, 40);
  assert.deepEqual(
    [0, 1].map((i) => catalogue.filter((p) => p.vendorIndex === i).length),
    [20, 20],
  );
  for (const category of categories)
    assert.equal(
      catalogue.filter((p) => p.category === category.slug).length,
      10,
    );
  assert.equal(accounts.filter((x) => x.role === "CUSTOMER").length, 1);
  assert.equal(accounts.filter((x) => x.role === "ADMIN").length, 1);
  assert.equal(accounts.filter((x) => x.role === "VENDOR").length, 2);
  for (const product of catalogue) {
    assert.ok(product.price > 0 && product.stock > 0);
    assert.ok(product.photos.length > 0);
    for (const photo of product.photos) {
      assert.ok(photo.alt);
      assert.ok(
        fs.existsSync(
          path.resolve(__dirname, "../../frontend/public/images", photo.file),
        ),
      );
    }
  }
  assert.equal(
    catalogue.reduce((n, p) => n + p.photos.length, 0),
    42,
  );
});

test("The travel pouch retains its three matching gallery views when the catalogue grows", () => {
  const pouch = catalogue.find(
    (product) => product.name === "The Travel Pouch",
  );
  assert.deepEqual(
    pouch.photos.map((photo) => photo.file),
    ["seed-pouch.jpg", "seed-pouch-side.jpg", "seed-pouch-detail.jpg"],
  );
  for (const product of catalogue.filter((product) => product !== pouch))
    assert.ok(
      product.photos.every((photo) => !photo.file.startsWith("seed-pouch")),
    );
});
