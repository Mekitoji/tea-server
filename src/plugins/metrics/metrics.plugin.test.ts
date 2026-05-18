import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";

import {
  PROMETHEUS_CONTENT_TYPE,
  renderPrometheusMetrics,
  resetMetricsForTests,
} from "../../shared/metrics";
import { metricsPlugin } from "./metrics.plugin";

describe("metricsPlugin", () => {
  it("records HTTP request counters and duration histograms with route labels", async () => {
    resetMetricsForTests();

    const app = new Elysia()
      .use(metricsPlugin)
      .get("/api/v1/devices/:id", () => ({ ok: true }))
      .get("/api/v1/metrics", ({ set }) => {
        set.headers["content-type"] = PROMETHEUS_CONTENT_TYPE;

        return renderPrometheusMetrics();
      });

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

    const app = new Elysia()
      .use(metricsPlugin)
      .get("/api/v1/health", () => ({ status: "ok" }))
      .get("/api/v1/metrics", () => renderPrometheusMetrics());

    await app.handle(new Request("http://localhost/api/v1/health"));
    await app.handle(new Request("http://localhost/api/v1/metrics"));

    const metrics = renderPrometheusMetrics();

    expect(metrics).not.toContain("http_requests_total{");
    expect(metrics).not.toContain('route="/api/v1/health"');
    expect(metrics).not.toContain('route="/api/v1/metrics"');
  });

  it("records unhandled errors as 500 responses", async () => {
    resetMetricsForTests();

    const app = new Elysia().use(metricsPlugin).get("/api/v1/fail", () => {
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
});
