export class AppError extends Error {
  constructor(
    message: string,
    public readonly code = "APP_ERROR",
    public readonly statusCode = 500,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, "CONFIGURATION_ERROR", 500);
    this.name = "ConfigurationError";
  }
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}
