import { logger } from "../../shared/logger";

let processErrorHandlersRegistered = false;
let fatalExitScheduled = false;

const scheduleFatalExit = () => {
  if (fatalExitScheduled) {
    return;
  }

  fatalExitScheduled = true;
  process.exitCode = 1;

  setTimeout(() => {
    process.exit(1);
  }, 0);
};

const logFatal = (event: string, error: unknown) => {
  logger.fatal(
    {
      event,
      ...(error instanceof Error ? { err: error } : { error }),
    },
    "fatal process error",
  );
};

export const registerProcessErrorHandlers = () => {
  if (processErrorHandlersRegistered) {
    return;
  }

  processErrorHandlersRegistered = true;

  process.on("unhandledRejection", (reason) => {
    logFatal("unhandledRejection", reason);
    scheduleFatalExit();
  });

  process.on("uncaughtException", (error, origin) => {
    logFatal(`uncaughtException:${origin}`, error);
    scheduleFatalExit();
  });
};
