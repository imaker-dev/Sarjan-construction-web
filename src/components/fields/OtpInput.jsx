import React, { useRef } from "react";

/**
 * Reusable OTP input (controlled).
 * - value: string of digits, onChange(nextString)
 * - supports typing, backspace, arrow keys, paste and SMS/email autofill
 */
export default function OtpInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  error = false,
  autoFocus = false,
  idPrefix = "otp",
}) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const focusAt = (i) => {
    const el = refs.current[Math.max(0, Math.min(length - 1, i))];
    el?.focus();
    el?.select();
  };

  const handleChange = (i, e) => {
    const input = e.target.value.replace(/\D/g, "");

    // Box emptied (selection delete etc.)
    if (!input) {
      onChange(value.slice(0, i) + value.slice(i + 1));
      return;
    }

    // Single digit, or several digits (autofill) inserted from this box
    const next = (value.slice(0, i) + input + value.slice(i + 1)).slice(
      0,
      length,
    );
    onChange(next);
    focusAt(Math.min(i + input.length, length - 1));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      onChange(value.slice(0, i - 1) + value.slice(i));
      focusAt(i - 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      focusAt(i + 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(pasted.length >= length ? length - 1 : pasted.length);
  };

  return (
    <div
      className="grid gap-2 sm:gap-3"
      style={{ gridTemplateColumns: `repeat(${length}, minmax(0, 1fr))` }}
      role="group"
      aria-label="Verification code"
    >
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`${idPrefix}-${i}`}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          aria-invalid={error || undefined}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`h-12 w-full min-w-0 rounded-lg border bg-white text-center text-xl font-semibold text-[#2A3547] outline-none transition focus:ring-4 disabled:opacity-60 dark:bg-slate-950 dark:text-white sm:h-14 sm:text-2xl ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : digit
                ? "border-primary-500 focus:border-primary-500 focus:ring-primary-500/15"
                : "border-slate-300 focus:border-primary-500 focus:ring-primary-500/15 dark:border-slate-700"
          }`}
        />
      ))}
    </div>
  );
}