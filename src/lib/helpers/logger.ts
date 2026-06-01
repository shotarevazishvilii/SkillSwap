type LogContext = Record<string, unknown>;
type LogLevel = "debug" | "info" | "warn" | "error";

type LogEntry = {
  context?: LogContext;
  level: LogLevel;
  message: string;
  timestamp: string;
};

function emitLog(entry: LogEntry) {
  const payload = entry.context ? [entry.message, entry.context] : [entry.message];

  switch (entry.level) {
    case "debug":
      console.debug(...payload);
      break;
    case "info":
      console.info(...payload);
      break;
    case "warn":
      console.warn(...payload);
      break;
    case "error":
      console.error(...payload);
      break;
  }
}

function log(level: LogLevel, message: string, context?: LogContext) {
  emitLog({ context, level, message, timestamp: new Date().toISOString() });
}

export const logger = {
  debug: (message: string, context?: LogContext) => log("debug", message, context),
  error: (message: string, context?: LogContext) => log("error", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
};
