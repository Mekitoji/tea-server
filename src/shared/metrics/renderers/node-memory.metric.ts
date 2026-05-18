import { MetricRenderer } from "./metric-renderer";

export class NodeMemoryMetrics extends MetricRenderer {
  render(lines: string[]) {
    const memoryUsage = process.memoryUsage();

    this.pushHelpAndType(
      lines,
      "nodejs_heap_size_total_bytes",
      "Process heap size from Node-compatible runtime memory usage.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_heap_size_total_bytes",
      {},
      memoryUsage.heapTotal,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_heap_size_used_bytes",
      "Process heap used from Node-compatible runtime memory usage.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_heap_size_used_bytes",
      {},
      memoryUsage.heapUsed,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_external_memory_bytes",
      "Node-compatible runtime external memory size in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_external_memory_bytes",
      {},
      memoryUsage.external,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_array_buffer_memory_bytes",
      "Node-compatible runtime ArrayBuffer memory size in bytes.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_array_buffer_memory_bytes",
      {},
      memoryUsage.arrayBuffers,
    );
  }
}
