import React, { type FC } from "react";
import ReactSelect, { type StylesConfig } from "react-select";
import { cn } from "~/lib/utils";

interface Option {
  label: string;
  value: string | number;
}

interface SelectInputProps {
  id: string;
  label: string;
  options: Option[];
  isMulti?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  values?: Record<string, unknown>;
  errors?: Record<string, unknown>;
  touched?: Record<string, unknown>;
  setFieldValue?: (field: string, value: unknown) => void;
  handleBlur?: React.FocusEventHandler;
}

/* Driven by CSS variables so the control flips with the active theme. */
const selectStyles: StylesConfig<Option, boolean> = {
  control: (base, state) => ({
    ...base,
    background: "var(--field)",
    borderColor: "var(--control)",
    borderRadius: "6px",
    boxShadow: "none",
    // The same ring every other control gets.
    outline: state.isFocused ? "2px solid var(--focus)" : "none",
    outlineOffset: "2px",
    minHeight: "36px",
    fontSize: "0.9375rem",
    transition: "border-color 150ms ease-out",
    "&:hover": { borderColor: "var(--ink-soft)" },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--surface)",
    border: "1px solid var(--pop-border)",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "var(--shadow-pop)",
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "color-mix(in srgb, var(--color-primary-500) 18%, transparent)"
      : state.isFocused
      ? "var(--surface-2)"
      : "transparent",
    color: "var(--ink)",
    fontSize: "0.9375rem",
    cursor: "pointer",
    "&:active": { background: "color-mix(in srgb, var(--color-primary-500) 25%, transparent)" },
  }),
  singleValue: (base) => ({ ...base, color: "var(--ink)" }),
  multiValue: (base) => ({
    ...base,
    background: "color-mix(in srgb, var(--color-primary-500) 14%, transparent)",
    borderRadius: "4px",
  }),
  multiValueLabel: (base) => ({ ...base, color: "var(--ink)", fontSize: "0.75rem" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--ink-soft)",
    borderRadius: "0 4px 4px 0",
    "&:hover": { background: "color-mix(in srgb, var(--color-primary-500) 30%, transparent)", color: "var(--ink)" },
  }),
  placeholder: (base) => ({ ...base, color: "var(--ink-muted)", fontSize: "0.9375rem" }),
  input: (base) => ({ ...base, color: "var(--ink)" }),
  indicatorSeparator: (base) => ({ ...base, background: "var(--line)" }),
  dropdownIndicator: (base) => ({ ...base, padding: 6, color: "var(--ink-muted)", "&:hover": { color: "var(--ink-soft)" } }),
  clearIndicator: (base) => ({ ...base, padding: 6, color: "var(--ink-muted)", "&:hover": { color: "var(--ink-soft)" } }),
};

const SelectInput: FC<SelectInputProps> = ({
  id,
  label,
  options,
  isMulti,
  placeholder,
  className,
  disabled,
  values = {},
  errors = {},
  touched = {},
  setFieldValue,
  handleBlur,
}) => {
  const hasError = Boolean(touched[id] && errors[id]);

  const selected = isMulti
    ? options.filter((o) => ((values[id] as (string | number)[]) || []).includes(o.value))
    : options.find((o) => o.value === values[id]) || null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="type-label text-ink">{label}</label>
      <ReactSelect
        inputId={id}
        options={options}
        isMulti={isMulti}
        isDisabled={disabled}
        placeholder={placeholder}
        value={selected}
        onChange={(val) => {
          if (isMulti) {
            setFieldValue?.(id, (val as Option[]).map((v) => v.value));
          } else {
            setFieldValue?.(id, (val as Option | null)?.value ?? null);
          }
        }}
        onBlur={handleBlur}
        styles={selectStyles}
        classNamePrefix="react-select"
      />
      {!!hasError && <p className="type-caption text-red-700 dark:text-red-300">{String(errors[id])}</p>}
    </div>
  );
};

export default SelectInput;
