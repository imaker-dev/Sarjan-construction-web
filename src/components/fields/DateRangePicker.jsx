import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "../../styles/additional-styles/date-range-picker.css";
import { Calendar, X } from "lucide-react";
import { formatDate } from "@utils/date.utils";
import {
  DATE_RANGES,
  PREDEFINED_RANGES,
  DEFAULT_DATE_RANGE,
  DEFAULT_BUSINESS_HOURS,
  toISODate,
  toLocalDate,
  hasValue,
  getPresetRange,
} from "@utils/dateRange.utils";

// ---------- Sidebar Component (Memoized) ----------
const RangeList = memo(({ activeRange, onSelect, isMobile }) => {
  return (
    <div className={`space-y-1 ${isMobile ? "p-2" : ""}`}>
      {PREDEFINED_RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => onSelect(range)}
          className={`w-full text-left px-3 py-2 text-sm font-medium transition-colors
            ${
              activeRange === range
                ? "bg-primary-500 text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
});

RangeList.displayName = "RangeList";

// "YYYY-MM-DD" strings (or Dates) -> react-date-range shape
const toPickerRange = (v) => ({
  startDate: toLocalDate(v.startDate),
  endDate: toLocalDate(v.endDate),
  key: "selection",
});

// ---------- Main Component ----------
export default function DateRangePicker({
  onChange,
  value,
  placeholder = "Select date range to filter",
  defaultRange = DEFAULT_DATE_RANGE,
  businessHours = DEFAULT_BUSINESS_HOURS,
  className = "",
}) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [activeRange, setActiveRange] = useState(defaultRange);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Stable even if the parent passes an inline object
  const { startHour, startMinute } = businessHours;
  const hours = useMemo(
    () => ({ startHour, startMinute }),
    [startHour, startMinute],
  );

  const [selectedRange, setSelectedRange] = useState(() => {
    if (hasValue(value)) return toPickerRange(value);
    return defaultRange ? getPresetRange(defaultRange, hours) : null;
  });

  const [tempRange, setTempRange] = useState(selectedRange);

  // Detect mobile screen size with debounce
  useEffect(() => {
    let timeoutId;

    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Sync external value
  useEffect(() => {
    if (!hasValue(value)) return;
    const next = toPickerRange(value);
    setSelectedRange(next);
    setTempRange(next);
  }, [value]);

  // Outside click
  useEffect(() => {
    const handler = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ESC close
  useEffect(() => {
    const keyHandler = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setShowCustomPicker(false);
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  // Auto flip alignment
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const popWidth = showCustomPicker ? (isMobile ? 320 : 850) : 240;
    const spaceRight = window.innerWidth - rect.left;
    const spaceLeft = rect.right;

    setAlignRight(spaceRight < popWidth && spaceLeft > spaceRight);
  }, [isOpen, showCustomPicker, isMobile]);

  const formatDisplayValue = useCallback(
    (range = selectedRange) => {
      if (!range?.startDate || !range?.endDate) return placeholder;
      const startStr = formatDate(range.startDate, isMobile ? "short" : "long");
      const endStr = formatDate(range.endDate, isMobile ? "short" : "long");
      return `${startStr} - ${endStr}`;
    },
    [selectedRange, placeholder, isMobile],
  );

  const emitChange = useCallback(
    (range) => {
      onChange?.({
        startDate: toISODate(range.startDate),
        endDate: toISODate(range.endDate),
      });
    },
    [onChange],
  );

  const closePopover = useCallback(() => {
    setIsOpen(false);
    setShowCustomPicker(false);
  }, []);

  const handleRangeSelect = useCallback(
    (range) => {
      setActiveRange(range);

      if (range === DATE_RANGES.CUSTOM) {
        setShowCustomPicker(true);
        setTempRange(selectedRange);
        return;
      }

      const next = getPresetRange(range, hours);
      if (!next) return;

      setSelectedRange(next);
      setTempRange(next);
      emitChange(next);
      closePopover();
    },
    [hours, selectedRange, emitChange, closePopover],
  );

  const handleApply = useCallback(() => {
    setSelectedRange(tempRange);
    setActiveRange(DATE_RANGES.CUSTOM);
    emitChange(tempRange);
    closePopover();
  }, [tempRange, emitChange, closePopover]);

  const handleCancel = useCallback(() => {
    setTempRange(selectedRange);
    setShowCustomPicker(false);
  }, [selectedRange]);

  // Fallback: parent has no real value yet -> emit the default range once.
  // (With the useDateRange hook the value is already set, so this never fires.)
  useEffect(() => {
    if (hasValue(value) || !defaultRange) return;

    const initial = getPresetRange(defaultRange, hours);
    if (!initial) return;

    setSelectedRange(initial);
    setTempRange(initial);
    emitChange(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount only

  // Keep the highlighted preset in sync with the external value
  useEffect(() => {
    if (!hasValue(value)) return;

    const start = toISODate(toLocalDate(value.startDate));
    const end = toISODate(toLocalDate(value.endDate));

    const matched = PREDEFINED_RANGES.find((range) => {
      const preset = getPresetRange(range, hours);
      return (
        preset &&
        toISODate(preset.startDate) === start &&
        toISODate(preset.endDate) === end
      );
    });

    setActiveRange(matched ?? DATE_RANGES.CUSTOM);
  }, [value, hours]);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="form-input flex items-center gap-2 bg-white dark:bg-gray-800 dark:border-gray-700"
        aria-label="Select date range"
        aria-expanded={isOpen}
      >
        <Calendar
          className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap overflow-hidden text-ellipsis">
          {formatDisplayValue()}
        </span>
      </button>

      {/* POPOVER */}
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          {isMobile && showCustomPicker && (
            <div
              className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
              onClick={closePopover}
              aria-hidden="true"
            />
          )}

          <div
            className={`
              bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50
              ${
                isMobile && showCustomPicker
                  ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-md max-h-[90vh]"
                  : showCustomPicker
                    ? `absolute top-full mt-2 ${alignRight ? "right-0" : "left-0"} w-[840px] max-w-[95vw]`
                    : `absolute top-full mt-2 ${alignRight ? "right-0" : "left-0"} w-[240px]`
              }
              overflow-hidden
            `}
            role="dialog"
            aria-label="Date range picker"
          >
            {!showCustomPicker ? (
              <RangeList
                activeRange={activeRange}
                onSelect={handleRangeSelect}
                isMobile={isMobile}
              />
            ) : (
              <div className="flex flex-col h-full max-h-[90vh]">
                {/* Mobile Header */}
                {isMobile && (
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                      Select Date Range
                    </h3>
                    <button
                      type="button"
                      onClick={closePopover}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      aria-label="Close"
                    >
                      <X
                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                )}

                {/* Main content area */}
                <div
                  className={`flex ${isMobile ? "flex-col" : "flex-row"} flex-1 min-h-0`}
                >
                  {/* Sidebar */}
                  <div
                    className={`${isMobile ? "border-b overflow-y-auto" : "border-r w-[200px]"} border-gray-200 dark:border-gray-700 flex-shrink-0`}
                  >
                    <div className="py-2">
                      <RangeList
                        activeRange={activeRange}
                        onSelect={handleRangeSelect}
                        isMobile={isMobile}
                      />
                    </div>
                  </div>

                  {/* Calendar container */}
                  <div className="flex-1 overflow-auto">
                    <div className={isMobile ? "p-2" : "p-0"}>
                      <DateRange
                        ranges={[tempRange]}
                        onChange={(item) =>
                          setTempRange({ ...item.selection, key: "selection" })
                        }
                        months={isMobile ? 1 : 2}
                        direction={isMobile ? "vertical" : "horizontal"}
                        showDateDisplay={false}
                        rangeColors={["var(--color-primary-500)"]}
                        moveRangeOnFirstSelection={false}
                        retainEndDateOnFirstSelection={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 gap-4 flex-shrink-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
                    {formatDisplayValue(tempRange)}
                  </span>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="btn btn-sm btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="btn btn-sm btn-primary"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}