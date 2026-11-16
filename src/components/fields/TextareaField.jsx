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
        className={`form-textarea resize-none
            ${error ? "is-invalid" : ""}
          `}
      />
    </FieldWrapper>
  );
}
