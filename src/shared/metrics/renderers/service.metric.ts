import { MetricRenderer } from "./metric-renderer";

export class ServiceMetrics extends MetricRenderer {
  private readonly serviceName = Bun.env.OTEL_SERVICE_NAME ?? "tea-server";

  render(lines: string[]) {
    this.pushHelpAndType(
      lines,
      "tea_server_info",
      "Static tea-server service information.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "tea_server_info",
      { service: this.serviceName },
      1,
    );

    this.pushHelpAndType(
      lines,
      "nodejs_version_info",
      "Node-compatible runtime version information.",
      "gauge",
    );
    this.pushMetricLine(
      lines,
      "nodejs_version_info",
      { version: process.version },
      1,
    );

    this.pushHelpAndType(
      lines,
      "bun_info",
      "Bun runtime version information.",
      "gauge",
    );
    this.pushMetricLine(lines, "bun_info", { version: Bun.version }, 1);
  }
}
