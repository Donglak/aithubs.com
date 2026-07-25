import i18n from "./index";

export function getChatbotErrorMessage(error: unknown): string {
  const t = i18n.t.bind(i18n);

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();

  if (
    message.includes("high demand") ||
    message.includes("503") ||
    message.includes("service unavailable")
  ) {
    return t("chatbot:errors.serviceBusy");
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("connection refused")
  ) {
    return t("chatbot:errors.network");
  }

  if (message.includes("invalid") || message.includes("không hợp lệ")) {
    return t("chatbot:errors.invalidResponse");
  }

  return t("chatbot:errors.unknown");
}
