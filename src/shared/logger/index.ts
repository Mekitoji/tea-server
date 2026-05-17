import pino, { type Logger, type LoggerOptions } from "pino";

import { getCurrentSpan } from "../telemetry";

const serviceName =
  Bun.env.LOG_SERVICE_NAME ?? Bun.env.OTEL_SERVICE_NAME ?? "tea-server";

const defaultLogLevel = () => {
  if (Bun.env.NODE_ENV === "test") {
    return "silent";
  }

  return Bun.env.NODE_ENV === "production" ? "info" : "debug";
};

const prettyLoggingEnabled = () => {
  if (Bun.env.LOG_PRETTY === "true") {
    return true;
  }

  if (Bun.env.LOG_PRETTY === "false") {
    return false;
  }

  return Bun.env.NODE_ENV !== "production" && Bun.env.NODE_ENV !== "test";
};

const redactPaths = [
  "authorization",
  "cookie",
  "headers.authorization",
  "headers.cookie",
  "headers.set-cookie",
  "request.headers.authorization",
  "request.headers.cookie",
  "request.headers.set-cookie",
  "req.headers.authorization",
  "req.headers.cookie",
  "req.headers.set-cookie",
  "body.password",
  "body.accessToken",
  "body.refreshToken",
  "body.deviceToken",
  "body.pairingSecret",
  "password",
  "accessToken",
  "refreshToken",
  "deviceToken",
  "pairingSecret",
];

const loggerOptions = (): LoggerOptions => ({
  level: Bun.env.LOG_LEVEL ?? defaultLogLevel(),
  base: {
    service: serviceName,
    env: Bun.env.NODE_ENV ?? "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: redactPaths,
    censor: "[xxx]",
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
  ...(prettyLoggingEnabled()
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: Bun.env.NO_COLOR !== "1",
            ignore: "pid,hostname",
            translateTime: "SYS:standard",
          },
        },
      }
    : {}),
});

export const logger = pino(loggerOptions());

export const createLogger = (bindings: pino.Bindings) => logger.child(bindings);

export const getTelemetryLogBindings = () => {
  const span = getCurrentSpan();
  const spanContext = span?.spanContext();

  if (!spanContext?.traceId) {
    return {};
  }

  return {
    trace_id: spanContext.traceId,
    span_id: spanContext.spanId,
  };
};

export type AppLogger = Logger;
