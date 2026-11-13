import { useSearchParams } from "react-router";

/**
 * Several setters called in the same tick (`setModal(null); setId(null)`) must
 * compose. React Router's functional updates all start from the current
 * location, so without this the last call would undo the earlier ones. Calls
 * within one tick share this pending copy and the last navigation wins with
 * every change applied.
 */
let pending: URLSearchParams | null = null;

export const useUrlState = (
  key: string
): [string | null, (val: string | null, options?: { replace?: boolean }) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = (val: string | null, options?: { replace?: boolean }) => {
    if (!pending) {
      pending = new URLSearchParams(window.location.search);
      queueMicrotask(() => {
        pending = null;
      });
    }
    if (val === null) pending.delete(key);
    else pending.set(key, val);
    setSearchParams(new URLSearchParams(pending), { replace: options?.replace });
  };

  return [value, setValue];
};
