import type { MetricFamily, MetricLabelValue } from "./metric";

export class PrometheusRenderer {
  render(families: MetricFamily[]) {
    const lines: string[] = [];

    for (const family of families) {
      lines.push(`# HELP ${family.name} ${family.help}`);
      lines.push(`# TYPE ${family.name} ${family.type}`);

      for (const sample of family.samples) {
        if (!Number.isFinite(sample.value)) {
          continue;
        }

        lines.push(
          `${sample.name}${this.labelsToText(sample.labels)} ${sample.value}`,
        );
      }
    }

    return `${lines.join("\n")}\n`;
  }

  private labelsToText(labels: Record<string, MetricLabelValue>) {
    const entries = Object.entries(labels);

    if (entries.length === 0) {
      return "";
    }

    const serialized = entries
      .map(([key, value]) => `${key}="${this.escapeLabelValue(String(value))}"`)
      .join(",");

    return `{${serialized}}`;
  }

  private escapeLabelValue(value: string) {
    return value
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/"/g, '\\"');
  }
}
