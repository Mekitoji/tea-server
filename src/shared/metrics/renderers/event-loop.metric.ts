import {
  monitorEventLoopDelay,
  performance as nodePerformance,
} from "node:perf_hooks";
import { MetricRenderer } from "./metric-renderer";

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

export class EventLoopMetrics extends MetricRenderer {
  constructor() {
    super();
    this.eventLoopDelayMonitor.enable();
  }

  private eventLoopDelayMonitor = monitorEventLoopDelay({
    resolution: readPositiveNumberEnv("METRICS_EVENT_LOOP_RESOLUTION_MS", 20),
  });

  render = (lines: string[]) => {
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

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_seconds",
      "Event loop lag mean in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_seconds",
      {},
      meanSeconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_min_seconds",
      "Event loop lag minimum in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_min_seconds",
      {},
      minSeconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_max_seconds",
      "Event loop lag maximum in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_max_seconds",
      {},
      maxSeconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_mean_seconds",
      "Event loop lag mean in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_mean_seconds",
      {},
      meanSeconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_stddev_seconds",
      "Event loop lag standard deviation in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_stddev_seconds",
      {},
      stddevSeconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_p50_seconds",
      "Event loop lag p50 in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_p50_seconds",
      {},
      p50Seconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_p90_seconds",
      "Event loop lag p90 in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_p90_seconds",
      {},
      p90Seconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_lag_p99_seconds",
      "Event loop lag p99 in seconds since the previous scrape.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_lag_p99_seconds",
      {},
      p99Seconds,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_utilization",
      "Event loop utilization ratio from the Node-compatible perf_hooks API.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_utilization",
      {},
      eventLoopUtilization.utilization,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_active_seconds_total",
      "Total active event loop time in seconds.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_active_seconds_total",
      {},
      eventLoopUtilization.active / 1000,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_eventloop_idle_seconds_total",
      "Total idle event loop time in seconds.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_eventloop_idle_seconds_total",
      {},
      eventLoopUtilization.idle / 1000,
    );

    this.eventLoopDelayMonitor.reset();
  };
}
