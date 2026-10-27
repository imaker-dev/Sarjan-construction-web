import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FieldWrapper } from "./FieldWrapper";

export function InputField({
  label,
  name,
  id,
  required,
  error,
  helperText,
  type = "text",
  placeholder = "",
  value,
  onChange,
  onBlur,
  disabled = false,
  icon: Icon,
  iconPosition = "left",
  autoComplete = "off",
  tooltip,
  maxLength, // NEW
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  const FinalRightIcon = iconPosition === "right" ? Icon : null;
  const FinalLeftIcon = iconPosition === "left" ? Icon : null;

  const inputId = id || name;

  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <FieldWrapper
      label={label}
      tooltip={tooltip}
      id={inputId}
      required={required}
      error={error}
      helperText={helperText}
      disabled={disabled}
    >
      <div className="relative">
        {/* LEFT ICON */}
        {FinalLeftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FinalLeftIcon size={16} className="text-gray-400" />
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={actualType}
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          className={`
            w-full
            form-input
            ${FinalLeftIcon ? "pl-10" : "pl-3"}
            ${FinalRightIcon || isPassword ? "pr-10" : "pr-3"}
            ${
              error
                && "border-red-300 bg-red-50"
            }
          `}
        />

        {/* RIGHT ICON */}
        {(isPassword || FinalRightIcon) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="flex items-center justify-center hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {!isPassword && FinalRightIcon && <FinalRightIcon size={16} />}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
