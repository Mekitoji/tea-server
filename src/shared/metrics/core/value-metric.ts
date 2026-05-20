import { createMetricFamily } from "./metric-family";
import type {
  MetricCollector,
  MetricFamily,
  MetricLabels,
  MetricOptions,
  MetricType,
} from "./metric";
import { MetricSeriesStore } from "./series-store";

type ValueMetricType = Extract<MetricType, "counter" | "gauge">;

type ValueMetricOptions<LabelName extends string> = MetricOptions<LabelName> & {
  type: ValueMetricType;
};

export class ValueMetric<LabelName extends string = never>
  implements MetricCollector
{
  protected readonly seriesStore: MetricSeriesStore<LabelName, number>;

  constructor(private readonly options: ValueMetricOptions<LabelName>) {
    this.seriesStore = new MetricSeriesStore(options.labelNames ?? []);
  }

  collect(): MetricFamily[] {
    const samples = [...this.seriesStore.values()].map((series) => ({
      labels: series.labels,
      value: series.value,
    }));

    return [createMetricFamily(this.options, samples)];
  }

  reset() {
    this.seriesStore.clear();
  }

  protected addValue(labels: MetricLabels<LabelName>, value: number) {
    if (!Number.isFinite(value)) {
      return;
    }

    const series = this.seriesStore.getOrCreate(labels, () => 0);
    series.value += value;
  }

  protected setValue(labels: MetricLabels<LabelName>, value: number) {
    if (!Number.isFinite(value)) {
      return;
    }

    const series = this.seriesStore.getOrCreate(labels, () => 0);
    series.value = value;
  }
}
