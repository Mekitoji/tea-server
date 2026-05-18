import type { ProcessWithActiveResources } from "../metrics.type";
import { MetricRenderer } from "./metric-renderer";

const processWithActiveResources = process as unknown as ProcessWithActiveResources;

const getActiveRequestsCount = () =>
  processWithActiveResources._getActiveRequests().length;

const getActiveHandlesCount = () =>
  processWithActiveResources._getActiveHandles().length;

export class ActiveResourceMetrics extends MetricRenderer {
  render(lines: string[]) {
    this.pushHelpAndType(
      lines,
      "nodejs_active_handles",
      "Number of active libuv handles.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_active_handles",
      {},
      getActiveHandlesCount(),
    );

    this.pushHelpAndType(
      lines,
      "nodejs_active_requests",
      "Number of active libuv requests.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_active_requests",
      {},
      getActiveRequestsCount(),
    );
  }
}
