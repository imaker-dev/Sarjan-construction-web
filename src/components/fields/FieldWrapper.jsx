import { Info } from "lucide-react";

export function FieldWrapper({
  label,
  id,
  required,
  error,
  helperText,
  disabled,
  children,
  tooltip,
}) {
  return (
    <div className={`space-y-1 w-full ${disabled ? "opacity-70" : ""}`}>
      {label && (
        <label
          htmlFor={id}
          className="form-label"
          // className="flex items-center gap-1 text-sm font-semibold text-gray-700 "
        >
          {label} {required && <span className="text-red-500">*</span>}
          {tooltip && (
            <span title={tooltip} className="inline-flex">
              <Info size={14} className="cursor-help text-slate-400" />
            </span>
          )}
        </label>
      )}

      {children}

      {/* {error && <p className="text-xs text-red-500">{error}</p>} */}
      {error && <p className="form-error">{error}</p>}

      {/* {helperText && <p className="text-xs text-gray-500">{helperText}</p>} */}
      {!error && helperText && <p className="form-hint">{helperText}</p>}
    </div>
  );
}
