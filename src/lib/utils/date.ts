const defaultDateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function formatDate(date: Date | string | number, formatter = defaultDateFormatter) {
  return formatter.format(new Date(date));
}

export function toIsoDate(date: Date | string | number) {
  return new Date(date).toISOString();
}

export function isFutureDate(date: Date | string | number) {
  return new Date(date).getTime() > Date.now();
}
