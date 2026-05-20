import {
  monitorEventLoopDelay,
  performance as nodePerformance,
} from "node:perf_hooks";
import { createMetricFamily, type MetricCollector } from "../core";

const readPositiveNumberEnv = (name: string, fallback: number) => {
  const raw = Bun.env[name];

  if (!raw) {
    return fallback;
  }

  const value = Number(raw);

  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const nanosecondsToSeconds = (value: number) => {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value / 1_000_000_000;
};

export class EventLoopCollector implements MetricCollector {
  private eventLoopDelayMonitor = monitorEventLoopDelay({
    resolution: readPositiveNumberEnv("METRICS_EVENT_LOOP_RESOLUTION_MS", 20),
  });

  constructor() {
    this.eventLoopDelayMonitor.enable();
  }

  collect() {
    const meanSeconds = nanosecondsToSeconds(this.eventLoopDelayMonitor.mean);
    const minSeconds = nanosecondsToSeconds(this.eventLoopDelayMonitor.min);
    const maxSeconds = nanosecondsToSeconds(this.eventLoopDelayMonitor.max);
    const stddevSeconds = nanosecondsToSeconds(
      this.eventLoopDelayMonitor.stddev,
    );
    const p50Seconds = nanosecondsToSeconds(
      this.eventLoopDelayMonitor.percentile(50),
    );
    const p90Seconds = nanosecondsToSeconds(
      this.eventLoopDelayMonitor.percentile(90),
    );
    const p99Seconds = nanosecondsToSeconds(
      this.eventLoopDelayMonitor.percentile(99),
    );
    const eventLoopUtilization = nodePerformance.eventLoopUtilization();

    const families = [
      createMetricFamily(
        {
          help: "Event loop lag mean in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: meanSeconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag minimum in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_min_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: minSeconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag maximum in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_max_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: maxSeconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag mean in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_mean_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: meanSeconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag standard deviation in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_stddev_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: stddevSeconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag p50 in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_p50_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: p50Seconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag p90 in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_p90_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: p90Seconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop lag p99 in seconds since the previous scrape.",
          name: "nodejs_eventloop_lag_p99_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: p99Seconds }],
      ),
      createMetricFamily(
        {
          help: "Event loop utilization ratio from the Node-compatible perf_hooks API.",
          name: "nodejs_eventloop_utilization",
          type: "gauge",
        },
        [{ labels: {}, value: eventLoopUtilization.utilization }],
      ),
      createMetricFamily(
        {
          help: "Total active event loop time in seconds.",
          name: "nodejs_eventloop_active_seconds_total",
          type: "counter",
        },
        [{ labels: {}, value: eventLoopUtilization.active / 1000 }],
      ),
      createMetricFamily(
        {
          help: "Total idle event loop time in seconds.",
          name: "nodejs_eventloop_idle_seconds_total",
          type: "counter",
        },
        [{ labels: {}, value: eventLoopUtilization.idle / 1000 }],
      ),
    ];

    this.eventLoopDelayMonitor.reset();

    return families;
  }
}
