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
    <span className="text-xs font-medium uppercase tracking-[0.08em] text-ink-muted">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="type-body h-9 w-full rounded-md border border-control bg-field pl-2.5 text-ink transition-colors duration-150 hover:border-ink-soft"
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
