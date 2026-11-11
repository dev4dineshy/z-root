export const epochNow = (): string => Date.now().toString();

export const parseTimestamp = (value?: string | null): Date | null => {
  if (!value) return null;
  const parsed = /^\d+$/.test(value) ? new Date(Number(value)) : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatTimestamp = (value?: string | null): string => {
  const parsed = parseTimestamp(value);
  return parsed
    ? parsed.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : value || "—";
};

