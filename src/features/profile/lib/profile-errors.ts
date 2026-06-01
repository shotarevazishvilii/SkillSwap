type SupabaseErrorLike = {
  code?: string | undefined;
  message?: string | undefined;
};

function normalizeError(error: unknown): SupabaseErrorLike {
  if (error && typeof error === "object") {
    const maybeError = error as { code?: unknown; message?: unknown };

    return {
      code: typeof maybeError.code === "string" ? maybeError.code : undefined,
      message: typeof maybeError.message === "string" ? maybeError.message : undefined,
    };
  }

  return {};
}

export function getProfileErrorMessage(error: unknown) {
  const normalizedError = normalizeError(error);
  const message = normalizedError.message?.toLowerCase() ?? "";

  if (
    normalizedError.code === "23505" ||
    message.includes("duplicate") ||
    message.includes("unique")
  ) {
    if (message.includes("username")) {
      return "That username is already taken. Choose another one.";
    }

    return "This skill is already on your profile.";
  }

  if (message.includes("network")) {
    return "Network error. Check your connection and try again.";
  }

  if (message.includes("permission") || message.includes("row-level security")) {
    return "You do not have permission to update this profile.";
  }

  return "We could not save your changes. Please try again.";
}
