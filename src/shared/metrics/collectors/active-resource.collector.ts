import { createMetricFamily, type MetricCollector } from "../core";
import type { ProcessWithActiveResources } from "../metrics.type";

const processWithActiveResources =
  process as unknown as ProcessWithActiveResources;

const getActiveRequestsCount = () =>
  processWithActiveResources._getActiveRequests().length;

const getActiveHandlesCount = () =>
  processWithActiveResources._getActiveHandles().length;

export class ActiveResourceCollector implements MetricCollector {
  collect() {
    return [
      createMetricFamily(
        {
          help: "Number of active libuv handles.",
          name: "nodejs_active_handles",
          type: "gauge",
        },
        [{ labels: {}, value: getActiveHandlesCount() }],
      ),
      createMetricFamily(
        {
          help: "Number of active libuv requests.",
          name: "nodejs_active_requests",
          type: "gauge",
        },
        [{ labels: {}, value: getActiveRequestsCount() }],
      ),
    ];
  }
}
