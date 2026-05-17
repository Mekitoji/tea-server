import { Elysia } from "elysia";

import {
  AppError,
  BadRequestError,
  ConflictError,
} from "../../shared/errors";
import {
  getTelemetryLogBindings,
  logger,
  type AppLogger,
} from "../../shared/logger";

interface ErrorResponse {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface PgErrorLike {
  code?: string;
  constraint?: string;
  detail?: string;
}

interface LoggerErrorContext {
  logger?: AppLogger;
  request?: Request;
  requestId?: string;
  path?: string;
  route?: string;
}

const getRequestPathname = (request?: Request) => {
  if (!request) {
    return undefined;
  }

  return new URL(request.url).pathname;
};

const getRequestLogBindings = (context: LoggerErrorContext) => ({
  ...getTelemetryLogBindings(),
  request_id: context.requestId,
  http: context.request
    ? {
        request: {
          method: context.request.method,
          path: context.path,
          route: context.route,
          url: getRequestPathname(context.request),
        },
      }
    : undefined,
});

const toErrorResponse = (error: AppError): ErrorResponse => {
  const body: ErrorResponse = {
    ok: false,
    error: {
      code: error.code,
      message: error.message,
    },
  };

  if (error.details !== undefined) {
    body.error.details = error.details;
  }

  return body;
};

const mapPgError = (error: unknown): AppError | null => {
  const pgError = error as PgErrorLike;

  switch (pgError.code) {
    case "23505":
      return new ConflictError(
        "Resource already exists",
        {
          constraint: pgError.constraint,
          detail: pgError.detail,
        },
        error,
      );
    case "23503":
      return new BadRequestError(
        "Related resource not found",
        {
          constraint: pgError.constraint,
          detail: pgError.detail,
        },
        error,
      );
    case "23514":
      return new BadRequestError(
        "Database constraint failed",
        {
          constraint: pgError.constraint,
          detail: pgError.detail,
        },
        error,
      );
    default:
      return null;
  }
};

export const errorPlugin = new Elysia({ name: "error-plugin" }).onError(
  { as: "global" },
  (context) => {
    const { code, error, set } = context;

    if (error instanceof AppError) {
      set.status = error.status;
      return toErrorResponse(error);
    }

    const pgError = mapPgError(error);

    if (pgError) {
      set.status = pgError.status;
      return toErrorResponse(pgError);
    }

    if (code === "VALIDATION") {
      set.status = 422;
      return {
        ok: false,
        error: {
          code: "validation_failed",
          message: "Request validation failed",
          details: error.all.map((item) => ({
            path: item.path,
            message: item.message,
            summary: item.summary,
          })),
        },
      } satisfies ErrorResponse;
    }

    if (code === "PARSE") {
      set.status = 400;
      return {
        ok: false,
        error: {
          code: "bad_request",
          message: "Invalid request body",
        },
      } satisfies ErrorResponse;
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        ok: false,
        error: {
          code: "not_found",
          message: "Route not found",
        },
      } satisfies ErrorResponse;
    }

    const loggerContext = context as LoggerErrorContext;
    const requestLogger = loggerContext.logger ?? logger;

    requestLogger.error(
      {
        ...getRequestLogBindings(loggerContext),
        code,
        ...(error instanceof Error ? { err: error } : { error }),
      },
      "unhandled request error",
    );
    set.status = 500;

    return {
      ok: false,
      error: {
        code: "internal_error",
        message: "Internal server error",
      },
    } satisfies ErrorResponse;
  },
);
