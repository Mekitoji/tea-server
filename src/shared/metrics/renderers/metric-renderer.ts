type MetricType = "counter" | "gauge" | "histogram";

export abstract class MetricRenderer {
  abstract render(lines: string[]): void;

  protected pushHelpAndType(
    lines: string[],
    name: string,
    help: string,
    type: MetricType,
  ) {
    lines.push(`# HELP ${name} ${help}`);
    lines.push(`# TYPE ${name} ${type}`);
  }

  protected pushMetricLine(
    lines: string[],
    name: string,
    labels: Record<string, string | number>,
    value: number,
  ) {
    if (!Number.isFinite(value)) {
      return;
    }

    lines.push(`${name}${this.labelsToText(labels)} ${value}`);
  }

  private labelsToText(labels: Record<string, string | number>) {
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
