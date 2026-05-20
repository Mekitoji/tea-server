import { createMetricFamily, type MetricCollector } from "../core";
import type { ActiveResourceCollector } from "./active-resource.collector";
import type { EventLoopCollector } from "./event-loop.collector";
import type { NodeMemoryCollector } from "./node-memory.collector";
import type { ResourceUsageCollector } from "./resource-usage.collector";

const processStartTimeSeconds = Date.now() / 1000;

const getCpuSecondsTotal = () => {
  const cpuUsage = process.cpuUsage();

  return (cpuUsage.user + cpuUsage.system) / 1_000_000;
};

export class ProcessCollector implements MetricCollector {
  constructor(
    private readonly nodeMemoryMetrics: NodeMemoryCollector,
    private readonly eventLoopMetrics: EventLoopCollector,
    private readonly activeResourceMetrics: ActiveResourceCollector,
    private readonly resourceUsageMetrics: ResourceUsageCollector,
  ) {}

  collect() {
    const memoryUsage = process.memoryUsage();

    return [
      createMetricFamily(
        {
          help: "Resident memory size in bytes.",
          name: "process_resident_memory_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.rss }],
      ),
      createMetricFamily(
        {
          help: "Heap memory used in bytes.",
          name: "process_heap_used_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.heapUsed }],
      ),
      createMetricFamily(
        {
          help: "Total heap memory in bytes.",
          name: "process_heap_total_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.heapTotal }],
      ),
      createMetricFamily(
        {
          help: "Total user and system CPU time spent in seconds.",
          name: "process_cpu_seconds_total",
          type: "counter",
        },
        [{ labels: {}, value: getCpuSecondsTotal() }],
      ),
      createMetricFamily(
        {
          help: "Start time of the process since unix epoch in seconds.",
          name: "process_start_time_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: processStartTimeSeconds }],
      ),
      createMetricFamily(
        {
          help: "Process uptime in seconds.",
          name: "process_uptime_seconds",
          type: "gauge",
        },
        [{ labels: {}, value: process.uptime() }],
      ),
      ...this.nodeMemoryMetrics.collect(),
      ...this.eventLoopMetrics.collect(),
      ...this.activeResourceMetrics.collect(),
      ...this.resourceUsageMetrics.collect(),
    ];
  }
}
