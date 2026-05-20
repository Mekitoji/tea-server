import type { MetricLabelValue, MetricLabels } from "./metric";

export const normalizeMetricLabels = <LabelName extends string>(
  labelNames: readonly LabelName[],
  labels: MetricLabels<LabelName>,
) => {
  const normalized: Record<string, MetricLabelValue> = {};

  for (const name of labelNames) {
    normalized[name] = labels[name];
  }

  return normalized;
};

export const normalizeMetricSampleLabels = <LabelName extends string>(
  labelNames: readonly LabelName[],
  labels: MetricLabels<LabelName>,
) => {
  const normalized = normalizeMetricLabels(labelNames, labels);

  for (const [key, value] of Object.entries(labels)) {
    if (!(key in normalized)) {
      normalized[key] = value as MetricLabelValue;
    }
  }

  return normalized;
};

export const createMetricLabelsKey = <LabelName extends string>(
  labelNames: readonly LabelName[],
  labels: MetricLabels<LabelName>,
) => JSON.stringify(labelNames.map((name) => String(labels[name])));
