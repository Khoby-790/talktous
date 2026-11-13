import { format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns";

const toDate = (date: string | Date) => (typeof date === "string" ? parseISO(date) : date);

export const formatDate = (date: string | Date, fmt = "dd MMM yyyy") => format(toDate(date), fmt);

export const formatDateTime = (date: string | Date) => format(toDate(date), "dd MMM yyyy, HH:mm");

export const formatRelative = (date: string | Date) =>
  formatDistanceToNowStrict(toDate(date), { addSuffix: true });

export const formatTime = (date: string | Date) => format(toDate(date), "HH:mm");

/** "14:05", "Yesterday", "Mon", or "12 Mar" — for list timestamps. */
export const formatShort = (date: string | Date) => {
  const d = toDate(date);
  if (isToday(d)) return format(d, "HH:mm");
  if (isYesterday(d)) return "Yesterday";
  if (Date.now() - d.getTime() < 6 * 24 * 3600 * 1000) return format(d, "EEE");
  return format(d, "dd MMM");
};

/** 75 → "1m 15s", 5400 → "1h 30m", null → "—". */
export const formatDuration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "—";
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${Math.round(seconds % 60)}s`.replace(/ 0s$/, "");
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ${minutes % 60}m`.replace(/ 0m$/, "");
  return `${Math.floor(hours / 24)}d ${hours % 24}h`.replace(/ 0h$/, "");
};

/** Percentage change, or null when there's no baseline. */
export const percentChange = (current: number | null, previous: number | null) => {
  if (current === null || previous === null || previous === 0) return null;
  return Math.round(((current - previous) / previous) * 100);
};
