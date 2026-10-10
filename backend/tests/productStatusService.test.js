const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveProductStatus } = require("../services/productStatusService");

test("zero stock is always out of stock", () => {
  assert.equal(
    resolveProductStatus({
      currentStatus: "ACTIVE",
      stock: 0,
      requestedStatus: "ACTIVE",
    }),
    "OUT_OF_STOCK",
  );
});

test("restocking an out-of-stock product reactivates it", () => {
  assert.equal(
    resolveProductStatus({ currentStatus: "OUT_OF_STOCK", stock: 2 }),
    "ACTIVE",
  );
});

test("archived products remain archived when restocked", () => {
  assert.equal(
    resolveProductStatus({ currentStatus: "ARCHIVED", stock: 2 }),
    undefined,
  );
});

test("stock changes do not publish drafts or archived listings", () => {
  for (const status of ["DRAFT", "ARCHIVED"]) {
    assert.equal(
      resolveProductStatus({ currentStatus: status, stock: 0 }),
      undefined,
    );
    assert.equal(
      resolveProductStatus({
        currentStatus: "ACTIVE",
        stock: 0,
        requestedStatus: status,
      }),
      status,
    );
  }
});
