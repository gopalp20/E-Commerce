import test from "node:test";
import assert from "node:assert/strict";
import { localPorts, assertLocalDatabase } from "./local-config.mjs";

test("copied demos can use separate ports while existing data keeps its port", () => {
  assert.deepEqual(localPorts({}), { db: 55432, api: 5050, web: 5173 });
  assert.deepEqual(
    localPorts({
      FORME_DB_PORT: "55433",
      FORME_API_PORT: "5052",
      FORME_WEB_PORT: "5175",
    }),
    { db: 55433, api: 5052, web: 5175 },
  );
  assert.equal(localPorts({}, 55433).db, 55433);
  assert.throws(
    () => localPorts({ FORME_DB_PORT: "55432" }, 55433),
    /preserve/,
  );
});

test("invalid or colliding ports fail before services start", () => {
  for (const value of ["", "0", "80", "65536", "5050.5", "5e3", "port", "-1"])
    assert.throws(() => localPorts({ FORME_API_PORT: value }), /integer/);
  assert.throws(() => localPorts({ FORME_API_PORT: "5173" }), /different/);
});

test("launcher refuses hosted, wrong-port, or wrong-database targets without disclosing credentials", () => {
  assert.doesNotThrow(() =>
    assertLocalDatabase(
      "postgresql://forme:private@127.0.0.1:55432/forme?schema=public",
      55432,
    ),
  );
  for (const value of [
    undefined,
    "not-a-url",
    "postgresql://forme:private@example.com:55432/forme",
    "postgresql://forme:private@127.0.0.1:55433/forme",
    "postgresql://forme:private@127.0.0.1:55432/production",
    "https://forme:private@127.0.0.1:55432/forme",
  ])
    assert.throws(
      () => assertLocalDatabase(value, 55432),
      (error) =>
        !error.message.includes("private") &&
        error.message.includes("local FORME"),
    );
});
