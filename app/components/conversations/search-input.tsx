import { type FC, useEffect, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useDebounce } from "~/hooks/ui/use-debounce";
import { cn } from "~/lib/utils";

/** Search box that reports a debounced value; stays in sync if `value` changes from outside (URL). */
export const SearchInput: FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder = "Search…", className }) => {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, 350);

  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border border-line bg-field px-3 text-ink-muted transition focus-within:border-primary-500",
        className,
      )}
    >
      <MagnifyingGlassIcon className="h-4 w-4 shrink-0" />
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
      />
      {text && (
        <button type="button" onClick={() => setText("")} aria-label="Clear search" className="hover:text-ink">
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
