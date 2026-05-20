import { createMetricLabelsKey, normalizeMetricLabels } from "./labels";
import type { MetricLabels } from "./metric";

export type MetricSeries<LabelName extends string, Value> = {
  labels: Record<LabelName, string | number>;
  value: Value;
};

export class MetricSeriesStore<LabelName extends string, Value> {
  private readonly seriesByKey = new Map<
    string,
    MetricSeries<LabelName, Value>
  >();

  constructor(private readonly labelNames: readonly LabelName[]) {}

  getOrCreate(labels: MetricLabels<LabelName>, createValue: () => Value) {
    const key = createMetricLabelsKey(this.labelNames, labels);
    const existing = this.seriesByKey.get(key);

    if (existing) {
      return existing;
    }

    const series = {
      labels: normalizeMetricLabels(this.labelNames, labels) as Record<
        LabelName,
        string | number
      >,
      value: createValue(),
    };

    this.seriesByKey.set(key, series);

    return series;
  }

  values() {
    return this.seriesByKey.values();
  }

  clear() {
    this.seriesByKey.clear();
  }
}
