import { describe, expect, it } from "bun:test";

import { Counter } from "./counter";
import { Histogram } from "./histogram";
import { PrometheusRenderer } from "./prometheus-renderer";

describe("metrics core", () => {
  it("keeps label sets distinct without delimiter-sensitive keys", () => {
    const counter = new Counter<"first" | "second">({
      help: "Test counter.",
      labelNames: ["first", "second"],
      name: "test_requests_total",
    });

    counter.inc({ first: "a,b", second: "c" });
    counter.inc({ first: "a", second: "b,c" }, 10);

    const output = new PrometheusRenderer().render(counter.collect());

    expect(output).toContain(
      'test_requests_total{first="a,b",second="c"} 1',
    );
    expect(output).toContain(
      'test_requests_total{first="a",second="b,c"} 10',
    );
  });

  it("renders escaped label values", () => {
    const counter = new Counter<"route">({
      help: "Test counter.",
      labelNames: ["route"],
      name: "test_escaped_total",
    });

    counter.inc({ route: '/api/"quoted"\\line\nbreak' });

    const output = new PrometheusRenderer().render(counter.collect());

    expect(output).toContain(
      'test_escaped_total{route="/api/\\"quoted\\"\\\\line\\nbreak"} 1',
    );
  });

  it("renders histogram buckets, sum, and count", () => {
    const histogram = new Histogram<"route">({
      buckets: [0.1, 0.5],
      help: "Test histogram.",
      labelNames: ["route"],
      name: "test_request_duration_seconds",
    });

    histogram.observe({ route: "/api/v1/users" }, 0.2);

    const output = new PrometheusRenderer().render(histogram.collect());

    expect(output).toContain(
      'test_request_duration_seconds_bucket{route="/api/v1/users",le="0.1"} 0',
    );
    expect(output).toContain(
      'test_request_duration_seconds_bucket{route="/api/v1/users",le="0.5"} 1',
    );
    expect(output).toContain(
      'test_request_duration_seconds_bucket{route="/api/v1/users",le="+Inf"} 1',
    );
    expect(output).toContain(
      'test_request_duration_seconds_sum{route="/api/v1/users"} 0.2',
    );
    expect(output).toContain(
      'test_request_duration_seconds_count{route="/api/v1/users"} 1',
    );
  });
});
