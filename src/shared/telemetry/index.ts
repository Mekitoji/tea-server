export {
  getCurrentSpan,
  record,
  setAttributes as setTelemetryAttributes,
} from "@elysia/opentelemetry";

import { record } from "@elysia/opentelemetry";

interface UseCaseWithExec {
  exec: (...args: any[]) => unknown;
}

interface UseCaseConstructor {
  new (...args: any[]): UseCaseWithExec;
  name: string;
  prototype: UseCaseWithExec;
}

const recordUseCaseExec = (
  useCaseName: string,
  exec: UseCaseWithExec["exec"],
  target: UseCaseWithExec,
  args: Parameters<UseCaseWithExec["exec"]>,
) =>
  record(`${useCaseName}`, (span) => {
    span.setAttributes({
      "app.layer": "use_case",
      "app.use_case": useCaseName,
    });

    return Reflect.apply(exec, target, args);
  });

export const UseCaseTelemetry = <T extends UseCaseConstructor>(
  target: T,
  context: ClassDecoratorContext<T>,
) => {
  if (context.kind !== "class") {
    return;
  }

  const originalExec = target.prototype.exec;

  if (typeof originalExec !== "function") {
    throw new Error("@UseCaseTelemetry can only decorate classes with exec()");
  }

  target.prototype.exec = function (this: UseCaseWithExec, ...args) {
    return recordUseCaseExec(target.name, originalExec, this, args);
  };
};
