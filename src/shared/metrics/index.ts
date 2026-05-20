import {
  ActiveResourceCollector,
  EventLoopCollector,
  HttpCollector,
  NodeMemoryCollector,
  ProcessCollector,
  PrometheusCollector,
  ResourceUsageCollector,
  ServiceCollector,
} from "./collectors";
import { MetricRegistry } from "./core";

export const PROMETHEUS_CONTENT_TYPE =
  "text/plain; version=0.0.4; charset=utf-8";

const httpMetrics = new HttpCollector();
const metricsRegistry = new MetricRegistry([
  new ServiceCollector(),
  new ProcessCollector(
    new NodeMemoryCollector(),
    new EventLoopCollector(),
    new ActiveResourceCollector(),
    new ResourceUsageCollector(),
  ),
  httpMetrics,
]);
const prometheusMetrics = new PrometheusCollector(metricsRegistry);

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
