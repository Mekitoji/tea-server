import type { MetricLabels, MetricOptions } from "./metric";
import { ValueMetric } from "./value-metric";

export class Counter<
  LabelName extends string = never,
> extends ValueMetric<LabelName> {
  constructor(options: MetricOptions<LabelName>) {
    super({
      ...options,
      type: "counter",
    });
  }

  inc(labels: MetricLabels<LabelName>, value = 1) {
    if (value < 0) {
      throw new Error("Counter cannot be incremented by a negative value.");
    }

    this.addValue(labels, value);
  }
}
