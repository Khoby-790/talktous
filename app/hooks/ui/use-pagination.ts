import { useState } from "react";
import { useDebounce } from "./use-debounce";

export const usePagination = (pageSize = 20) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const reset = () => {
    setPage(1);
    setSearch("");
  };

  return {
    page,
    setPage,
    search,
    setSearch,
    debouncedSearch,
    pageSize,
    offset: (page - 1) * pageSize,
    reset,
  };
};
