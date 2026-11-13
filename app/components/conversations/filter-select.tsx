import { type FC } from "react";
import { cn } from "~/lib/utils";

export type FilterOption = { value: string; label: string };

/** Compact native select for filter bars (themes with the Auros field tokens). */
export const FilterSelect: FC<{
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
}> = ({ label, value, options, onChange, className }) => (
  <label className={cn("flex flex-col gap-1", className)}>
    <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-md border border-line bg-field px-2.5 text-sm text-ink outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export const STATUS_OPTIONS: FilterOption[] = [
  { value: "open", label: "Open" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

export const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const CHANNEL_OPTIONS: FilterOption[] = [
  { value: "web", label: "Web chat" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "api", label: "API" },
];

export const withAll = (options: FilterOption[], label = "All"): FilterOption[] => [
  { value: "", label },
  ...options,
];
