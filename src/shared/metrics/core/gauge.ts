import type { MetricLabels, MetricOptions } from "./metric";
import { ValueMetric } from "./value-metric";

export class Gauge<
  LabelName extends string = never,
> extends ValueMetric<LabelName> {
  constructor(options: MetricOptions<LabelName>) {
    super({
      ...options,
      type: "gauge",
    });
  }

  set(labels: MetricLabels<LabelName>, value: number) {
    this.setValue(labels, value);
  }
}
