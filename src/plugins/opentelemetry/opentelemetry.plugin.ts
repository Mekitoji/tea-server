import { Elysia } from "elysia";
import { opentelemetry } from "@elysia/opentelemetry";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

const telemetryEnabled =
  Bun.env.OTEL_ENABLED === "true" && Bun.env.OTEL_SDK_DISABLED !== "true";

const shouldTraceHealthchecks = Bun.env.OTEL_TRACE_HEALTHCHECKS === "true";
const shouldTraceMetrics = Bun.env.OTEL_TRACE_METRICS === "true";

export const opentelemetryPlugin = telemetryEnabled
  ? opentelemetry({
      serviceName: Bun.env.OTEL_SERVICE_NAME ?? "tea-server",
      spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
      instrumentations: [
        new PgInstrumentation({
          enhancedDatabaseReporting:
            Bun.env.OTEL_PG_ENHANCED_DATABASE_REPORTING === "true",
          requireParentSpan: true,
        }),
      ],
      headersToSpanAttributes: {
        request: ["user-agent", "x-request-id", "traceparent"],
        response: ["content-length"],
      },
      recordBody: false,
      checkIfShouldTrace: (request) => {
        const pathname = new URL(request.url).pathname;

        if (!shouldTraceMetrics && pathname === "/api/v1/metrics") {
          return false;
        }

        if (shouldTraceHealthchecks) {
          return true;
        }

        return pathname !== "/api/v1/health";
      },
    })
  : new Elysia({ name: "telemetry-disabled" });
