import { createMetricFamily, type MetricCollector } from "../core";

const normalizeMaxRssBytes = (maxRss: number) => {
  if (maxRss > 10 * 1024 * 1024) {
    return maxRss;
  }

  return maxRss * 1024;
};

export class ResourceUsageCollector implements MetricCollector {
  collect() {
    const resourceUsage = process.resourceUsage();

    return [
      createMetricFamily(
        {
          help: "User CPU time from process.resourceUsage in seconds.",
          name: "nodejs_resource_user_cpu_seconds_total",
          type: "counter",
        },
        [{ labels: {}, value: resourceUsage.userCPUTime / 1_000_000 }],
      ),
      createMetricFamily(
        {
          help: "System CPU time from process.resourceUsage in seconds.",
          name: "nodejs_resource_system_cpu_seconds_total",
          type: "counter",
        },
        [{ labels: {}, value: resourceUsage.systemCPUTime / 1_000_000 }],
      ),
      createMetricFamily(
        {
          help: "Maximum resident set size from process.resourceUsage in bytes.",
          name: "nodejs_resource_max_rss_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: normalizeMaxRssBytes(resourceUsage.maxRSS) }],
      ),
      createMetricFamily(
        {
          help: "Filesystem input operations from process.resourceUsage.",
          name: "nodejs_resource_fs_read_total",
          type: "counter",
        },
        [{ labels: {}, value: resourceUsage.fsRead }],
      ),
      createMetricFamily(
        {
          help: "Filesystem output operations from process.resourceUsage.",
          name: "nodejs_resource_fs_write_total",
          type: "counter",
        },
        [{ labels: {}, value: resourceUsage.fsWrite }],
      ),
      createMetricFamily<"type">(
        {
          help: "Voluntary and involuntary context switches from process.resourceUsage.",
          labelNames: ["type"],
          name: "nodejs_resource_context_switches_total",
          type: "counter",
        },
        [
          {
            labels: { type: "voluntary" },
            value: resourceUsage.voluntaryContextSwitches,
          },
          {
            labels: { type: "involuntary" },
            value: resourceUsage.involuntaryContextSwitches,
          },
        ],
      ),
    ];
  }
}
