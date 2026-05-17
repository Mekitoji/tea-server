export type AppErrorCode =
  | "bad_request"
  | "conflict"
  | "forbidden"
  | "internal_error"
  | "not_found"
  | "unauthorized"
  | "validation_failed";

export interface AppErrorOptions {
  code: AppErrorCode;
  message: string;
  status: number;
  details?: unknown;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(options: AppErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown, cause?: unknown) {
    super({
      code: "bad_request",
      message,
      status: 400,
      details,
      cause,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown, cause?: unknown) {
    super({
      code: "unauthorized",
      message,
      status: 401,
      details,
      cause,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown, cause?: unknown) {
    super({
      code: "forbidden",
      message,
      status: 403,
      details,
      cause,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown, cause?: unknown) {
    super({
      code: "not_found",
      message,
      status: 404,
      details,
      cause,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", details?: unknown, cause?: unknown) {
    super({
      code: "conflict",
      message,
      status: 409,
      details,
      cause,
    });
  }
}

export class ValidationAppError extends AppError {
  constructor(
    message = "Validation failed",
    details?: unknown,
    cause?: unknown,
  ) {
    super({
      code: "validation_failed",
      message,
      status: 422,
      details,
      cause,
    });
  }
}
