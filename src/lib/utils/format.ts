const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 0,
});

export function formatNumber(value: number) {
  return numberFormatter.format(value);
}

export function formatInitials(nameOrEmail: string) {
  const normalized = nameOrEmail.trim();

  if (!normalized) {
    return "SS";
  }

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("");
}
