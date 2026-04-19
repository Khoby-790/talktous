import { useSearchParams } from "react-router";

export const useUrlState = (
  key: string
): [string | null, (val: string | null) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = (val: string | null) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val === null) {
        next.delete(key);
      } else {
        next.set(key, val);
      }
      return next;
    });
  };

  return [value, setValue];
};
