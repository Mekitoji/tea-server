import { MetricRenderer } from "./metric-renderer";

const normalizeMaxRssBytes = (maxRss: number) => {
  if (maxRss > 10 * 1024 * 1024) {
    return maxRss;
  }

  return maxRss * 1024;
};

export class ResourceUsageMetrics extends MetricRenderer {
  render(lines: string[]) {
    const resourceUsage = process.resourceUsage();

    this.pushHelpAndType(
      lines,
      "nodejs_resource_user_cpu_seconds_total",
      "User CPU time from process.resourceUsage in seconds.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_user_cpu_seconds_total",
      {},
      resourceUsage.userCPUTime / 1_000_000,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_resource_system_cpu_seconds_total",
      "System CPU time from process.resourceUsage in seconds.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_system_cpu_seconds_total",
      {},
      resourceUsage.systemCPUTime / 1_000_000,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_resource_max_rss_bytes",
      "Maximum resident set size from process.resourceUsage in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_max_rss_bytes",
      {},
      normalizeMaxRssBytes(resourceUsage.maxRSS),
    );

    this.pushHelpAndType(
      lines,
      "nodejs_resource_fs_read_total",
      "Filesystem input operations from process.resourceUsage.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_fs_read_total",
      {},
      resourceUsage.fsRead,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_resource_fs_write_total",
      "Filesystem output operations from process.resourceUsage.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_fs_write_total",
      {},
      resourceUsage.fsWrite,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_resource_context_switches_total",
      "Voluntary and involuntary context switches from process.resourceUsage.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_context_switches_total",
      { type: "voluntary" },
      resourceUsage.voluntaryContextSwitches,
    );
    this.pushMetricLine(
      lines,
      "nodejs_resource_context_switches_total",
      { type: "involuntary" },
      resourceUsage.involuntaryContextSwitches,
    );
  }
}
