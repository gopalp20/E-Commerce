import { test } from "node:test";
import assert from "node:assert/strict";
import { vendorItemTotal } from "../src/lib/vendorScope.mjs";
const order = {
  totalAmount: "1069.3",
  shippingAmount: "149",
  items: [
    { price: "10.10", quantity: 3, product: { vendorId: 2, price: "99" } },
    { price: "890", quantity: 1, product: { vendorId: 3 } },
  ],
};
test("Vendor report uses purchased prices and excludes other sellers and delivery", () => {
  assert.equal(vendorItemTotal(order, "2"), 30.3);
  assert.equal(vendorItemTotal(order, "3"), 890);
});
test("Unknown vendors have zero attributed item value", () => {
  assert.equal(vendorItemTotal(order, "999"), 0);
});
test("All item totals preserve currency precision", () => {
  assert.equal(vendorItemTotal(order, ""), 920.3);
  assert.equal(vendorItemTotal({ items: [] }, ""), 0);
});
