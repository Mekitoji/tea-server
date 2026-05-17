import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

describe("loggerPlugin", () => {
  it("propagates request IDs through the response header and context", async () => {
    Bun.env.LOG_LEVEL = "silent";
    Bun.env.LOG_PRETTY = "false";

    const { loggerPlugin } = await import("./logger.plugin");
    const app = new Elysia()
      .use(loggerPlugin)
      .get("/request-id", ({ requestId }) => ({ requestId }));

    const response = await app.handle(
      new Request("http://localhost/request-id", {
        headers: {
          "x-request-id": "req_test",
        },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("req_test");
    expect(await response.json()).toEqual({ requestId: "req_test" });
  });
});
