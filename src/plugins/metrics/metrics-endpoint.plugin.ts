import { Elysia } from "elysia";

import {
  PROMETHEUS_CONTENT_TYPE,
  renderPrometheusMetrics,
} from "../../shared/metrics";
import { isMetricsEnabled } from "../../shared/metrics/metrics.config";

export const createMetricsEndpointPlugin = () => {
  if (!isMetricsEnabled()) {
    return new Elysia({ name: "metrics-endpoint-plugin-disabled" });
  }

  return new Elysia({ name: "metrics-endpoint-plugin" }).get(
    "/metrics",
    ({ set }) => {
      set.headers["content-type"] = PROMETHEUS_CONTENT_TYPE;

      return renderPrometheusMetrics();
    },
  );
};
