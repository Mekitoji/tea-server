import { normalizeMetricSampleLabels } from "./labels";
import type {
  MetricFamily,
  MetricFamilyOptions,
  MetricLabels,
} from "./metric";

type MetricFamilySampleInput<LabelName extends string> = {
  labels: MetricLabels<LabelName>;
  name?: string;
  value: number;
};

export const createMetricFamily = <LabelName extends string = never>(
  options: MetricFamilyOptions<LabelName>,
  samples: readonly MetricFamilySampleInput<LabelName>[],
): MetricFamily => {
  const labelNames = options.labelNames ?? [];

  return {
    help: options.help,
    name: options.name,
    samples: samples.map((sample) => ({
      labels: normalizeMetricSampleLabels(labelNames, sample.labels),
      name: sample.name ?? options.name,
      value: sample.value,
    })),
    type: options.type,
  };
};
