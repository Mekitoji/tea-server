import type {
  HistogramState,
  HttpDurationLabels,
  HttpRequestLabels,
} from "../metrics.type";
import { MetricRenderer } from "./metric-renderer";

export class HttpMetrics extends MetricRenderer {
  private httpRequestCounts = new Map<string, number>();
  private httpRequestCountLabels = new Map<string, HttpRequestLabels>();
  private httpDurationLabels = new Map<string, HttpDurationLabels>();
  private httpRequestDurations = new Map<string, HistogramState>();

  private readonly defaultHttpDurationBuckets = [
    0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10,
  ];

  private createKey = (values: string[]) => JSON.stringify(values);

  record(input: {
    durationSeconds: number;
    method: string;
    route: string;
    statusCode: number;
  }) {
    const method = input.method.toUpperCase();
    const route = input.route;
    const statusCode = String(input.statusCode);

    const countKey = this.createKey([method, route, statusCode]);
    this.httpRequestCountLabels.set(countKey, { method, route, statusCode });
    this.httpRequestCounts.set(
      countKey,
      (this.httpRequestCounts.get(countKey) ?? 0) + 1,
    );

    const durationKey = this.createKey([method, route]);
    const histogram = this.httpRequestDurations.get(durationKey) ?? {
      buckets: this.defaultHttpDurationBuckets.map(() => 0),
      count: 0,
      sum: 0,
    };

    this.defaultHttpDurationBuckets.forEach((bucket, index) => {
      if (input.durationSeconds <= bucket) {
        histogram.buckets[index] = (histogram.buckets[index] ?? 0) + 1;
      }
    });

    histogram.count += 1;
    histogram.sum += input.durationSeconds;

    this.httpDurationLabels.set(durationKey, { method, route });
    this.httpRequestDurations.set(durationKey, histogram);
  }

  render(lines: string[]) {
    this.pushHelpAndType(
      lines,
      "http_requests_total",
      "Total HTTP requests handled by the API.",
      "counter",
    );

    for (const [key, value] of this.httpRequestCounts.entries()) {
      const labels = this.httpRequestCountLabels.get(key);

      if (!labels) {
        continue;
      }

      this.pushMetricLine(
        lines,
        "http_requests_total",
        {
          method: labels.method,
          route: labels.route,
          status_code: labels.statusCode,
        },
        value,
      );
    }

    this.pushHelpAndType(
      lines,
      "http_request_duration_seconds",
      "HTTP request duration in seconds.",
      "histogram",
    );

    for (const [key, histogram] of this.httpRequestDurations.entries()) {
      const labels = this.httpDurationLabels.get(key);

      if (!labels) {
        continue;
      }

      this.defaultHttpDurationBuckets.forEach((bucket, index) => {
        this.pushMetricLine(
          lines,
          "http_request_duration_seconds_bucket",
          {
            method: labels.method,
            route: labels.route,
            le: bucket,
          },
          histogram.buckets[index] ?? 0,
        );
      });

      this.pushMetricLine(
        lines,
        "http_request_duration_seconds_bucket",
        {
          method: labels.method,
          route: labels.route,
          le: "+Inf",
        },
        histogram.count,
      );
      this.pushMetricLine(
        lines,
        "http_request_duration_seconds_sum",
        {
          method: labels.method,
          route: labels.route,
        },
        histogram.sum,
      );
      this.pushMetricLine(
        lines,
        "http_request_duration_seconds_count",
        {
          method: labels.method,
          route: labels.route,
        },
        histogram.count,
      );
    }
  }

  resetMetricsForTests = () => {
    this.httpRequestCounts.clear();
    this.httpRequestCountLabels.clear();
    this.httpRequestDurations.clear();
    this.httpDurationLabels.clear();
  };
}
