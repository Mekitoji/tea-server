import { Elysia } from "elysia";

import {
  createLogger,
  getTelemetryLogBindings,
  type AppLogger,
} from "../../shared/logger";

interface RequestLogContext {
  logger: AppLogger;
  requestId: string;
  startedAt: number;
  remoteIp?: string;
}

interface PrincipalLogContext {
  currentUser?: {
    id?: string;
  } | null;
  currentDevice?: {
    deviceId?: string;
    userId?: string;
  } | null;
}

const requestContexts = new WeakMap<Request, RequestLogContext>();

const shouldLogHealthchecks = Bun.env.LOG_HTTP_HEALTHCHECKS === "true";
const shouldLogMetrics = Bun.env.LOG_HTTP_METRICS === "true";
const accessLogsEnabled = Bun.env.LOG_HTTP_ACCESS !== "false";

const readHeader = (request: Request, name: string) =>
  request.headers.get(name) ?? undefined;

const readRequestId = (request: Request) =>
  readHeader(request, "x-request-id") ??
  readHeader(request, "x-correlation-id") ??
  crypto.randomUUID();

const readRemoteIp = (request: Request) => {
  const forwardedFor = readHeader(request, "x-forwarded-for");
  const firstForwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedIp ||
    readHeader(request, "x-real-ip") ||
    readHeader(request, "cf-connecting-ip")
  );
};

const getPathname = (request: Request) => new URL(request.url).pathname;

const shouldLogRequest = (request: Request) => {
  const pathname = getPathname(request);

  return (
    accessLogsEnabled &&
    (shouldLogHealthchecks || pathname !== "/api/v1/health") &&
    (shouldLogMetrics || pathname !== "/api/v1/metrics")
  );
};

const getStatusCode = (status: unknown, responseValue: unknown) => {
  if (typeof status === "number") {
    return status;
  }

  if (responseValue instanceof Response) {
    return responseValue.status;
  }

  return undefined;
};

const getLogLevel = (statusCode?: number) => {
  if (statusCode === undefined) {
    return "info";
  }

  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "info";
};

const getPrincipalBindings = (context: PrincipalLogContext) => {
  if (context.currentDevice) {
    return {
      user_id: context.currentDevice.userId,
      device_id: context.currentDevice.deviceId,
    };
  }

  if (context.currentUser) {
    return {
      user_id: context.currentUser.id,
    };
  }

  return {};
};

const getRequestContext = (request: Request) => {
  const requestId = readRequestId(request);
  const remoteIp = readRemoteIp(request);
  const requestLogger = createLogger({
    request_id: requestId,
    remote_ip: remoteIp,
  });
  const context = {
    logger: requestLogger,
    requestId,
    startedAt: performance.now(),
    remoteIp,
  };

  requestContexts.set(request, context);

  return context;
};

export const loggerPlugin = new Elysia({ name: "logger-plugin" })
  .onRequest(({ request, set }) => {
    const context = getRequestContext(request);

    set.headers["x-request-id"] = context.requestId;
  })
  .derive({ as: "global" }, ({ request }) => {
    const context = requestContexts.get(request) ?? getRequestContext(request);

    return {
      logger: context.logger,
      requestId: context.requestId,
    };
  })
  .onAfterResponse({ as: "global" }, (context) => {
    const { request, responseValue, set, path, route } = context;

    if (!shouldLogRequest(request)) {
      requestContexts.delete(request);
      return;
    }

    const requestContext =
      requestContexts.get(request) ?? getRequestContext(request);
    const durationMs =
      Math.round((performance.now() - requestContext.startedAt) * 100) / 100;
    const statusCode = getStatusCode(set.status, responseValue);
    const level = getLogLevel(statusCode);
    const requestUrl = new URL(request.url);

    requestContext.logger[level](
      {
        ...getTelemetryLogBindings(),
        ...getPrincipalBindings(context as PrincipalLogContext),
        http: {
          request: {
            method: request.method,
            path,
            route,
            url: requestUrl.pathname,
            user_agent: readHeader(request, "user-agent"),
          },
          response: {
            status_code: statusCode,
          },
        },
        duration_ms: durationMs,
      },
      "http request completed",
    );

    requestContexts.delete(request);
  });
