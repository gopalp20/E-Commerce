import { test } from "node:test";
import assert from "node:assert/strict";
import { constrainView, zoomAt } from "../src/lib/galleryView.mjs";
const image = { width: 800, height: 600 },
  stage = { width: 1000, height: 700 };
test("zoom preserves the detail beneath the pointer", () => {
  const next = zoomAt(
    { scale: 1, x: 0, y: 0 },
    2,
    { x: 100, y: 50 },
    image,
    stage,
  );
  assert.deepEqual(next, { scale: 2, x: -100, y: -50 });
  assert.equal((100 - next.x) / next.scale, 100);
});
test("pan clamps to image edges and fit always recenters", () => {
  assert.deepEqual(
    constrainView({ scale: 2, x: 5000, y: -5000 }, image, stage),
    { scale: 2, x: 300, y: -250 },
  );
  const fit = constrainView({ scale: 0.3, x: 200, y: -200 }, image, stage);
  assert.equal(fit.scale, 1);
  assert.equal(Math.abs(fit.x), 0);
  assert.equal(Math.abs(fit.y), 0);
  assert.equal(constrainView({ scale: 10, x: 0, y: 0 }, image, stage).scale, 4);
});
test("portrait images remain centered on an axis smaller than the viewport", () => {
  const view = constrainView(
    { scale: 2, x: 900, y: 900 },
    { width: 200, height: 600 },
    stage,
  );
  assert.equal(Math.abs(view.x), 0);
  assert.equal(view.y, 250);
});
