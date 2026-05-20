import type { MetricCollector, MetricFamily } from "./metric";

export class MetricRegistry {
  constructor(private readonly collectors: MetricCollector[]) {}

  collect(): MetricFamily[] {
    return this.collectors.flatMap((collector) => collector.collect());
  }

  reset() {
    this.collectors.forEach((collector) => collector.reset?.());
  }
}
