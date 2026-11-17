import React, { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * @typedef {Object} SearchBarProps
 * @property {string} [value] Current search term. Keeps the input in sync when the parent changes or resets it.
 * @property {(value: string) => void} onSearch Called with the search term (debounced while typing, immediate on Enter and clear).
 * @property {number} [debounceMs] Delay in milliseconds while typing. `0` disables debounce. Default: `0`
 * @property {string} [placeholder] Input placeholder. Default: `"Search..."`
 * @property {string} [width] Wrapper width class. Default: `"w-full"`
 * @property {string} [className] Extra classes for the input.
 * @property {boolean} [disabled] Disable the input. Default: `false`
 */

/**
 * Renders a <div role="search"> (not a <form>), so it can safely be used
 * inside other forms without nested-form / hydration errors.
 *
 * @param {SearchBarProps} props
 */
export default function SearchBar({
  value = "",
  onSearch,
  debounceMs = 0,
  placeholder = "Search...",
  width = "w-full",
  className = "",
  disabled = false,
}) {
  const [input, setInput] = useState(value);
  const timerRef = useRef(null);
  const lastSent = useRef(value);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Sync when the parent changes/resets `value` (ignore echoes of what we just sent)
  useEffect(() => {
    if (value !== lastSent.current) {
      lastSent.current = value;
      setInput(value);
    }
  }, [value]);

  // Cancel pending call on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const send = (next, immediate = false) => {
    clearTimeout(timerRef.current);

    const run = () => {
      lastSent.current = next;
      onSearchRef.current?.(next);
    };

    if (immediate || debounceMs <= 0) run();
    else timerRef.current = setTimeout(run, debounceMs);
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    send(e.target.value);
  };

  const handleKeyDown = (e) => {
    // Enter searches immediately and never submits a parent <form>
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send(input, true);
    }
  };

  const handleClear = () => {
    setInput("");
    send("", true);
  };

  return (
    <div role="search" className={`relative ${width}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
      </div>

      <input
        type="search"
        autoComplete="off"
        aria-label={placeholder}
        placeholder={placeholder}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`form-input block w-full pl-9 pr-8 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden ${className}`}
      />

      {input && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-2 flex items-center"
        >
          <X className="h-4 w-4 text-slate-400 hover:text-slate-500" />
        </button>
      )}
    </div>
  );
}
