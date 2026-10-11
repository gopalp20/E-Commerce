const { test, mock } = require("node:test");
const assert = require("node:assert/strict");
const { globalErrorHandler } = require("../middleware/errorMiddleware");

test("Database outages return a recoverable status without disclosing connection details", () => {
  const logger = mock.method(console, "error", () => {});
  try {
    for (const code of ["P1001", "P1002", "P1008", "P1017", "P2024", "P2028"]) {
      const response = {
        headers: {},
        set(k, v) {
          this.headers[k] = v;
        },
        status(n) {
          this.code = n;
          return this;
        },
        json(body) {
          this.body = body;
        },
      };
      globalErrorHandler(
        { code, message: "private database location" },
        {},
        response,
        () => {},
      );
      assert.equal(response.code, 503);
      assert.equal(response.headers["Retry-After"], "5");
      assert.match(response.body.message, /temporarily unavailable/);
      assert.ok(
        !JSON.stringify(response).includes("private database location"),
      );
    }
    assert.ok(
      logger.mock.calls.every(
        (call) =>
          !call.arguments.join(" ").includes("private database location"),
      ),
    );
  } finally {
    logger.mock.restore();
  }
});
