const fallbackMessage = "We could not complete your request. Please try again.";

export const existingAccountMessage =
  "This email is already registered. Please sign in instead.";

type AuthErrorLike = {
  code?: string | undefined;
  message?: string | undefined;
  status?: number | undefined;
};

export function isExistingAccountError(error: AuthErrorLike | null | undefined) {
  if (!error) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? "";
  const code = error.code?.toLowerCase() ?? "";

  return (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already exists") ||
    message.includes("user already registered") ||
    message.includes("email address is already registered")
  );
}

export function getAuthErrorMessage(error: AuthErrorLike | null | undefined) {
  if (!error) {
    return fallbackMessage;
  }

  const message = error.message?.toLowerCase() ?? "";

  if (message.includes("invalid login credentials")) {
    return "The email or password you entered is incorrect.";
  }

  if (isExistingAccountError(error)) {
    return existingAccountMessage;
  }

  if (message.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (message.includes("password") && message.includes("weak")) {
    return "Choose a stronger password and try again.";
  }

  if (
    message.includes("expired") ||
    message.includes("invalid token") ||
    message.includes("session")
  ) {
    return "This link is invalid or expired. Please request a new one.";
  }

  if (message.includes("network") || error.status === 0) {
    return "Network error. Check your connection and try again.";
  }

  return fallbackMessage;
}
