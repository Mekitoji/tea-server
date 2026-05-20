import { createMetricFamily } from "./metric-family";
import type {
  MetricCollector,
  MetricFamily,
  MetricLabels,
  MetricOptions,
} from "./metric";
import { MetricSeriesStore } from "./series-store";

type HistogramState = {
  buckets: number[];
  count: number;
  sum: number;
};

type HistogramOptions<LabelName extends string> = MetricOptions<LabelName> & {
  buckets: readonly number[];
};

export class Histogram<LabelName extends string = never>
  implements MetricCollector
{
  private readonly buckets: number[];
  private readonly seriesStore: MetricSeriesStore<LabelName, HistogramState>;

  constructor(private readonly options: HistogramOptions<LabelName>) {
    this.buckets = [...options.buckets].sort((left, right) => left - right);
    this.seriesStore = new MetricSeriesStore(options.labelNames ?? []);
  }

  observe(labels: MetricLabels<LabelName>, value: number) {
    if (!Number.isFinite(value)) {
      return;
    }

    const series = this.seriesStore.getOrCreate(labels, () => ({
      buckets: this.buckets.map(() => 0),
      count: 0,
      sum: 0,
    }));

    this.buckets.forEach((bucket, index) => {
      if (value <= bucket) {
        series.value.buckets[index] = (series.value.buckets[index] ?? 0) + 1;
      }
    });

    series.value.count += 1;
    series.value.sum += value;
  }

  collect(): MetricFamily[] {
    const samples = [...this.seriesStore.values()].flatMap((series) => {
      const bucketSamples = this.buckets.map((bucket, index) => ({
        labels: {
          ...series.labels,
          le: bucket,
        },
        name: `${this.options.name}_bucket`,
        value: series.value.buckets[index] ?? 0,
      }));

      return [
        ...bucketSamples,
        {
          labels: {
            ...series.labels,
            le: "+Inf",
          },
          name: `${this.options.name}_bucket`,
          value: series.value.count,
        },
        {
          labels: series.labels,
          name: `${this.options.name}_sum`,
          value: series.value.sum,
        },
        {
          labels: series.labels,
          name: `${this.options.name}_count`,
          value: series.value.count,
        },
      ];
    });

    return [
      createMetricFamily(
        {
          help: this.options.help,
          labelNames: this.options.labelNames,
          name: this.options.name,
          type: "histogram",
        },
        samples,
      ),
    ];
  }

  reset() {
    this.seriesStore.clear();
  }
}
