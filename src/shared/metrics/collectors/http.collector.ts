import { Counter, Histogram, type MetricCollector } from "../core";
import type { HttpDurationLabels, HttpRequestLabels } from "../metrics.type";

type HttpRequestLabelName = keyof HttpRequestLabels;
type HttpDurationLabelName = keyof HttpDurationLabels;

export class HttpCollector implements MetricCollector {
  private readonly httpRequestCounts = new Counter<HttpRequestLabelName>({
    help: "Total HTTP requests handled by the API.",
    labelNames: ["method", "route", "status_code"],
    name: "http_requests_total",
  });

  private readonly httpRequestDurations = new Histogram<HttpDurationLabelName>({
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    help: "HTTP request duration in seconds.",
    labelNames: ["method", "route"],
    name: "http_request_duration_seconds",
  });

  record(input: {
    durationSeconds: number;
    method: string;
    route: string;
    statusCode: number;
  }) {
    const method = input.method.toUpperCase();
    const route = input.route;

    this.httpRequestCounts.inc({
      method,
      route,
      status_code: String(input.statusCode),
    });

    this.httpRequestDurations.observe(
      {
        method,
        route,
      },
      input.durationSeconds,
    );
  }

  collect() {
    return [
      ...this.httpRequestCounts.collect(),
      ...this.httpRequestDurations.collect(),
    ];
  }

  reset() {
    this.httpRequestCounts.reset();
    this.httpRequestDurations.reset();
  }

  resetMetricsForTests = () => {
    this.reset();
  };
}
