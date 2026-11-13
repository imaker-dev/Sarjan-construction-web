
import { FieldWrapper } from "./FieldWrapper";

export function SelectField({
  label,
  name,
  id,
  required,
  error,
  helperText,
  options = [],
  value,
  onChange,
  onBlur,
  disabled = false,
  loading = false,
  placeholder = "Select",
  emptyText = "No options available",
  disabledText = "Disabled",
}) {
  const inputId = id || name;
  const isDisabled = disabled || loading;

  return (
    <FieldWrapper
      label={label}
      id={inputId}
      required={required}
      error={error}
      helperText={helperText}
      disabled={isDisabled}
    >
      <select
        id={inputId}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
        disabled={isDisabled}
        aria-invalid={!!error}
        className="form-select w-full"
      >
        {loading ? (
          <option value="">Loading...</option>
        ) : disabled ? (
          <option value="">{disabledText}</option>
        ) : (
          <>
            <option value="">{placeholder}</option>

            {options.length > 0 ? (
              options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {emptyText}
              </option>
            )}
          </>
        )}
      </select>
    </FieldWrapper>
  );
}
