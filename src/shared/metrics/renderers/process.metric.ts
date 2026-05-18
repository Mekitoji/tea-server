import type { ActiveResourceMetrics } from "./active-resource.metric";
import type { EventLoopMetrics } from "./event-loop.metric";
import type { NodeMemoryMetrics } from "./node-memory.metric";
import type { ResourceUsageMetrics } from "./resource-usage.metric";
import { MetricRenderer } from "./metric-renderer";

const processStartTimeSeconds = Date.now() / 1000;

const getCpuSecondsTotal = () => {
  const cpuUsage = process.cpuUsage();

  return (cpuUsage.user + cpuUsage.system) / 1_000_000;
};

export class ProcessMetrics extends MetricRenderer {
  constructor(
    private readonly nodeMemoryMetrics: NodeMemoryMetrics,
    private readonly eventLoopMetrics: EventLoopMetrics,
    private readonly activeResourceMetrics: ActiveResourceMetrics,
    private readonly resourceUsageMetrics: ResourceUsageMetrics,
  ) {
    super();
  }

  render(lines: string[]) {
    const memoryUsage = process.memoryUsage();

    this.pushHelpAndType(
      lines,
      "process_resident_memory_bytes",
      "Resident memory size in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "process_resident_memory_bytes",
      {},
      memoryUsage.rss,
    );

    this.pushHelpAndType(
      lines,
      "process_heap_used_bytes",
      "Heap memory used in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "process_heap_used_bytes",
      {},
      memoryUsage.heapUsed,
    );

    this.pushHelpAndType(
      lines,
      "process_heap_total_bytes",
      "Total heap memory in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "process_heap_total_bytes",
      {},
      memoryUsage.heapTotal,
    );

    this.pushHelpAndType(
      lines,
      "process_cpu_seconds_total",
      "Total user and system CPU time spent in seconds.",
      "counter",
    );
    this.pushMetricLine(
      lines,
      "process_cpu_seconds_total",
      {},
      getCpuSecondsTotal(),
    );

    this.pushHelpAndType(
      lines,
      "process_start_time_seconds",
      "Start time of the process since unix epoch in seconds.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "process_start_time_seconds",
      {},
      processStartTimeSeconds,
    );

    this.pushHelpAndType(
      lines,
      "process_uptime_seconds",
      "Process uptime in seconds.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "process_uptime_seconds",
      {},
      process.uptime(),
    );

    this.nodeMemoryMetrics.render(lines);
    this.eventLoopMetrics.render(lines);
    this.activeResourceMetrics.render(lines);
    this.resourceUsageMetrics.render(lines);
  }
}
