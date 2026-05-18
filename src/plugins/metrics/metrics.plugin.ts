import { Elysia } from "elysia";

import { recordHttpRequestMetric } from "../../shared/metrics";

interface RequestMetricsContext {
  startedAt: number;
}

const requestContexts = new WeakMap<Request, RequestMetricsContext>();
const recordedRequests = new WeakSet<Request>();

const shouldMeasureHealthchecks = Bun.env.METRICS_HTTP_HEALTHCHECKS === "true";

const getPathname = (request: Request) => new URL(request.url).pathname;

const shouldRecordRequest = (request: Request) => {
  const pathname = getPathname(request);

  if (pathname === "/api/v1/metrics") {
    return false;
  }

  return pathname !== "/api/v1/health" || shouldMeasureHealthchecks;
};

const getStatusCode = (
  status: unknown,
  responseValue: unknown,
  fallbackStatusCode: number,
) => {
  if (typeof status === "number") {
    return status;
  }

  if (responseValue instanceof Response) {
    return responseValue.status;
  }

  return fallbackStatusCode;
};

const getErrorStatusCode = (error: unknown, status: unknown) => {
  if (typeof status === "number") {
    return status;
  }

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }

  return 500;
};

const sanitizeRouteLabel = (route: string) =>
  route
    .replace(
      /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\/|$)/gi,
      "/:id",
    )
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/\/[A-Za-z0-9_-]{16,}(?=\/|$)/g, "/:id");

const getRouteLabel = (route: unknown, path: unknown, request: Request) => {
  const candidate =
    typeof route === "string" && route.length > 0
      ? route
      : typeof path === "string" && path.length > 0
        ? path
        : getPathname(request);

  return sanitizeRouteLabel(candidate);
};

const recordRequest = (context: {
  request: Request;
  responseValue: unknown;
  route: unknown;
  path: unknown;
  set: {
    status?: unknown;
  };
  fallbackStatusCode: number;
}) => {
  const { request, responseValue, route, path, set, fallbackStatusCode } =
    context;

  if (recordedRequests.has(request)) {
    return;
  }

  if (!shouldRecordRequest(request)) {
    requestContexts.delete(request);
    recordedRequests.add(request);
    return;
  }

  const requestContext = requestContexts.get(request);

  if (!requestContext) {
    return;
  }

  recordHttpRequestMetric({
    durationSeconds: (performance.now() - requestContext.startedAt) / 1000,
    method: request.method,
    route: getRouteLabel(route, path, request),
    statusCode: getStatusCode(set.status, responseValue, fallbackStatusCode),
  });

  requestContexts.delete(request);
  recordedRequests.add(request);
};

export const metricsPlugin = new Elysia({ name: "metrics-plugin" })
  .onRequest(({ request }) => {
    requestContexts.set(request, {
      startedAt: performance.now(),
    });
  })
  .onAfterHandle({ as: "global" }, (context) => {
    recordRequest({
      ...context,
      fallbackStatusCode: 200,
    });
  })
  .onError({ as: "global" }, (context) => {
    recordRequest({
      ...context,
      responseValue: undefined,
      route: undefined,
      path: getPathname(context.request),
      fallbackStatusCode: getErrorStatusCode(context.error, context.set.status),
    });
  });
