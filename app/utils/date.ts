import { format, formatDistanceToNow, parseISO } from "date-fns";

export const formatDate = (date: string, fmt = "dd/MM/yyyy") =>
  format(parseISO(date), fmt);

export const formatDateTime = (date: string) =>
  format(parseISO(date), "dd/MM/yyyy HH:mm");

export const formatRelative = (date: string) =>
  formatDistanceToNow(parseISO(date), { addSuffix: true });

export const formatTime = (date: string) => format(parseISO(date), "HH:mm");
