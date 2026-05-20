export type MetricType = "counter" | "gauge" | "histogram";

export type MetricLabelValue = string | number;

export type MetricLabels<LabelName extends string = string> = Record<
  LabelName,
  MetricLabelValue
>;

export type MetricOptions<LabelName extends string = never> = {
  help: string;
  labelNames?: readonly LabelName[];
  name: string;
};

export type MetricFamilyOptions<LabelName extends string = never> =
  MetricOptions<LabelName> & {
    type: MetricType;
  };

export type MetricSample = {
  labels: Record<string, MetricLabelValue>;
  name: string;
  value: number;
};

export type MetricFamily = {
  help: string;
  name: string;
  samples: MetricSample[];
  type: MetricType;
};

export interface MetricCollector {
  collect(): MetricFamily[];
  reset?(): void;
}
