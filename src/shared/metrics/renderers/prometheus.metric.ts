import type { HttpMetrics } from "./http.metric";
import type { ProcessMetrics } from "./process.metric";
import type { ServiceMetrics } from "./service.metric";

export class PrometheusMetrics {
  constructor(
    private readonly serviceMetrics: ServiceMetrics,
    private readonly processMetrics: ProcessMetrics,
    private readonly httpMetrics: HttpMetrics,
  ) {}
  render() {
    const lines: string[] = [];

    this.serviceMetrics.render(lines);
    this.processMetrics.render(lines);
    this.httpMetrics.render(lines);

    return `${lines.join("\n")}\n`;
  }
}
