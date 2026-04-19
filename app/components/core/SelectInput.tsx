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

const darkStyles: StylesConfig<Option, boolean> = {
  control: (base, state) => ({
    ...base,
    background: "var(--color-surface-elevated)",
    borderColor: state.isFocused ? "#2563eb" : "rgba(255,255,255,0.1)",
    boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
    minHeight: "38px",
    fontSize: "0.875rem",
    "&:hover": { borderColor: state.isFocused ? "#2563eb" : "rgba(255,255,255,0.2)" },
  }),
  menu: (base) => ({
    ...base,
    background: "var(--color-surface-elevated)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  }),
  option: (base, state) => ({
    ...base,
    background: state.isSelected
      ? "rgba(124,58,237,0.25)"
      : state.isFocused
      ? "rgba(255,255,255,0.05)"
      : "transparent",
    color: state.isSelected ? "#c4b5fd" : "#cbd5e1",
    fontSize: "0.875rem",
    cursor: "pointer",
    "&:active": { background: "rgba(124,58,237,0.35)" },
  }),
  singleValue: (base) => ({ ...base, color: "#e2e8f0" }),
  multiValue: (base) => ({ ...base, background: "rgba(124,58,237,0.2)" }),
  multiValueLabel: (base) => ({ ...base, color: "#c4b5fd", fontSize: "0.75rem" }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#8b7cf8",
    "&:hover": { background: "rgba(124,58,237,0.4)", color: "#ede9fe" },
  }),
  placeholder: (base) => ({ ...base, color: "#475569", fontSize: "0.875rem" }),
  input: (base) => ({ ...base, color: "#e2e8f0" }),
  indicatorSeparator: (base) => ({ ...base, background: "rgba(255,255,255,0.1)" }),
  dropdownIndicator: (base) => ({ ...base, color: "#475569", "&:hover": { color: "#94a3b8" } }),
  clearIndicator: (base) => ({ ...base, color: "#475569", "&:hover": { color: "#94a3b8" } }),
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
  const hasError = touched[id] && errors[id];

  const selected = isMulti
    ? options.filter((o) => ((values[id] as (string | number)[]) || []).includes(o.value))
    : options.find((o) => o.value === values[id]) || null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-sm font-medium text-slate-400">{label}</label>
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
        styles={darkStyles}
        classNamePrefix="react-select"
      />
      {!!hasError && <p className="text-xs text-red-400">{String(errors[id])}</p>}
    </div>
  );
};

export default SelectInput;
