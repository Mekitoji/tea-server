import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

import {
  renderPrometheusMetrics,
  resetMetricsForTests,
} from "../../shared/metrics";
import { createMetricsEndpointPlugin } from "./metrics-endpoint.plugin";
import { createMetricsPlugin } from "./metrics.plugin";

const createTestApp = () =>
  new Elysia({ prefix: "/api/v1" })
    .use(createMetricsPlugin())
    .use(createMetricsEndpointPlugin());

const withMetricsEnabled = async (
  value: string | undefined,
  callback: () => Promise<void>,
) => {
  const previousValue = Bun.env.METRICS_ENABLED;

  if (value === undefined) {
    delete Bun.env.METRICS_ENABLED;
  } else {
    Bun.env.METRICS_ENABLED = value;
  }

  try {
    await callback();
  } finally {
    if (previousValue === undefined) {
      delete Bun.env.METRICS_ENABLED;
    } else {
      Bun.env.METRICS_ENABLED = previousValue;
    }
  }
};

describe("metricsPlugin", () => {
  it("records HTTP request counters and duration histograms with route labels", async () => {
    resetMetricsForTests();

    const app = createTestApp().get("/devices/:id", () => ({ ok: true }));

    const response = await app.handle(
      new Request("http://localhost/api/v1/devices/device_1234567890abcdef"),
    );
    expect(response.status).toBe(200);

    const metricsResponse = await app.handle(
      new Request("http://localhost/api/v1/metrics"),
    );
    const metrics = await metricsResponse.text();

    expect(metricsResponse.headers.get("content-type")).toContain(
      "text/plain",
    );
    expect(metrics).toContain(
      'http_requests_total{method="GET",route="/api/v1/devices/:id",status_code="200"} 1',
    );
    expect(metrics).toContain(
      'http_request_duration_seconds_count{method="GET",route="/api/v1/devices/:id"} 1',
    );
    expect(metrics).toContain("nodejs_eventloop_lag_p99_seconds");
    expect(metrics).toContain("nodejs_heap_size_used_bytes");
    expect(metrics).toContain("nodejs_active_handles");
    expect(metrics).toContain("bun_info");
    expect(metrics).not.toContain("device_1234567890abcdef");
  });

  it("does not record healthcheck or metrics scrapes by default", async () => {
    resetMetricsForTests();

    const app = createTestApp().get("/health", () => ({ status: "ok" }));

    await app.handle(new Request("http://localhost/api/v1/health"));
    await app.handle(new Request("http://localhost/api/v1/metrics"));

    const metrics = renderPrometheusMetrics();

    expect(metrics).not.toContain("http_requests_total{");
    expect(metrics).not.toContain('route="/api/v1/health"');
    expect(metrics).not.toContain('route="/api/v1/metrics"');
  });

  it("records unhandled errors as 500 responses", async () => {
    resetMetricsForTests();

    const app = createTestApp().get("/fail", () => {
      throw new Error("boom");
    });

    const response = await app.handle(
      new Request("http://localhost/api/v1/fail"),
    );

    expect(response.status).toBe(500);
    expect(renderPrometheusMetrics()).toContain(
      'http_requests_total{method="GET",route="/api/v1/fail",status_code="500"} 1',
    );
  });

  it("does not register metrics endpoint or record requests when metrics are disabled", async () => {
    await withMetricsEnabled("false", async () => {
      resetMetricsForTests();

      const app = createTestApp().get("/devices/:id", () => ({ ok: true }));

      const response = await app.handle(
        new Request("http://localhost/api/v1/devices/device_1234567890abcdef"),
      );
      expect(response.status).toBe(200);

      const metricsResponse = await app.handle(
        new Request("http://localhost/api/v1/metrics"),
      );
      expect(metricsResponse.status).toBe(404);
      expect(renderPrometheusMetrics()).not.toContain("http_requests_total{");
    });
  });
});
