import {
  ActiveResourceMetrics,
  EventLoopMetrics,
  HttpMetrics,
  NodeMemoryMetrics,
  ProcessMetrics,
  PrometheusMetrics,
  ResourceUsageMetrics,
  ServiceMetrics,
} from "./renderers";

export const PROMETHEUS_CONTENT_TYPE =
  "text/plain; version=0.0.4; charset=utf-8";

const httpMetrics = new HttpMetrics();
const prometheusMetrics = new PrometheusMetrics(
  new ServiceMetrics(),
  new ProcessMetrics(
    new NodeMemoryMetrics(),
    new EventLoopMetrics(),
    new ActiveResourceMetrics(),
    new ResourceUsageMetrics(),
  ),
  httpMetrics,
);

export const recordHttpRequestMetric = (input: {
  durationSeconds: number;
  method: string;
  route: string;
  statusCode: number;
}) => {
  httpMetrics.record(input);
};

export const renderPrometheusMetrics = () => prometheusMetrics.render();

export const resetMetricsForTests = () => {
  httpMetrics.resetMetricsForTests();
};
