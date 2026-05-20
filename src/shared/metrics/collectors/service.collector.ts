import { Gauge, type MetricCollector } from "../core";

export class ServiceCollector implements MetricCollector {
  private readonly serviceName = Bun.env.OTEL_SERVICE_NAME ?? "tea-server";

  private readonly serviceInfo = new Gauge<"service">({
    help: "Static tea-server service information.",
    labelNames: ["service"],
    name: "tea_server_info",
  });

  private readonly nodeVersionInfo = new Gauge<"version">({
    help: "Node-compatible runtime version information.",
    labelNames: ["version"],
    name: "nodejs_version_info",
  });

  private readonly bunInfo = new Gauge<"version">({
    help: "Bun runtime version information.",
    labelNames: ["version"],
    name: "bun_info",
  });

  collect() {
    this.serviceInfo.set({ service: this.serviceName }, 1);
    this.nodeVersionInfo.set({ version: process.version }, 1);
    this.bunInfo.set({ version: Bun.version }, 1);

    return [
      ...this.serviceInfo.collect(),
      ...this.nodeVersionInfo.collect(),
      ...this.bunInfo.collect(),
    ];
  }

  reset() {
    this.serviceInfo.reset();
    this.nodeVersionInfo.reset();
    this.bunInfo.reset();
  }
}
