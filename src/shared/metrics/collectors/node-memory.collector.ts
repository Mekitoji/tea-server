import { createMetricFamily, type MetricCollector } from "../core";

export class NodeMemoryCollector implements MetricCollector {
  collect() {
    const memoryUsage = process.memoryUsage();

    return [
      createMetricFamily(
        {
          help: "Process heap size from Node-compatible runtime memory usage.",
          name: "nodejs_heap_size_total_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.heapTotal }],
      ),
      createMetricFamily(
        {
          help: "Process heap used from Node-compatible runtime memory usage.",
          name: "nodejs_heap_size_used_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.heapUsed }],
      ),
      createMetricFamily(
        {
          help: "Node-compatible runtime external memory size in bytes.",
          name: "nodejs_external_memory_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.external }],
      ),
      createMetricFamily(
        {
          help: "Node-compatible runtime ArrayBuffer memory size in bytes.",
          name: "nodejs_array_buffer_memory_bytes",
          type: "gauge",
        },
        [{ labels: {}, value: memoryUsage.arrayBuffers }],
      ),
    ];
  }
}
