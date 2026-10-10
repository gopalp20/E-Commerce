const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const { catalogue, accounts, categories } = require("../prisma/demoCatalogue");
test("Demo catalogue has twenty distinct products, balanced vendors and complete local photo assets", () => {
  assert.equal(catalogue.length, 20);
  assert.equal(new Set(catalogue.map((p) => p.name)).size, 20);
  assert.deepEqual(
    [0, 1].map((i) => catalogue.filter((p) => p.vendorIndex === i).length),
    [10, 10],
  );
  for (const category of categories)
    assert.equal(
      catalogue.filter((p) => p.category === category.slug).length,
      5,
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
    22,
  );
});
