import { useSearchParams } from "react-router-dom";

export function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = Object.fromEntries(searchParams.entries());

  const get = (key, defaultValue = null) => {
    return searchParams.get(key) ?? defaultValue;
  };

  const has = (key) => {
    return searchParams.has(key);
  };

  const set = (key, value) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);

      if (value === null || value === undefined || value === "") {
        updated.delete(key);
      } else {
        updated.set(key, String(value));
      }

      return updated;
    });
  };

  const remove = (key) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.delete(key);
      return updated;
    });
  };

  return {
    params,
    get,
    has,
    set,
    remove,
    searchParams,
    setSearchParams,
  };
}