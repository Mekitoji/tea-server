import { MetricRegistry, PrometheusRenderer } from "../core";

export class PrometheusCollector {
  private readonly renderer = new PrometheusRenderer();

  constructor(private readonly registry: MetricRegistry) {}

  render() {
    return this.renderer.render(this.registry.collect());
  }
}
