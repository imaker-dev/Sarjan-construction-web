import { FieldWrapper } from "./FieldWrapper";

export function TextareaField({
  label,
  name,
  id,
  required,
  error,
  helperText,
  value,
  onChange,
  onBlur,
  disabled = false,
  placeholder = "Type here...",
  rows = 4,
  maxLength, // NEW
  ...props
}) {
  const inputId = id || name;

  return (
    <FieldWrapper
      label={label}
      id={inputId}
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled}
    >
      <textarea
        id={inputId}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        {...props}
        className={`
          w-full resize-none rounded-md shadow-sm border px-3 py-2 text-sm
          transition-colors
          focus:outline-none

          placeholder:text-slate-400
          text-slate-700

          ${
            disabled
              ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
              : error
              ? "border-red-300 bg-red-50"
              : "bg-white border-slate-200 hover:border-slate-300"
          }
        `}
      />
    </FieldWrapper>
  );
}