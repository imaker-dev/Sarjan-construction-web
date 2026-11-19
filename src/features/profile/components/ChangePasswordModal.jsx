import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import ModalBasic from "@components/ui/ModalBasic";
import { InputField } from "@components/fields/InputField";

import { Check, Loader2 } from "lucide-react";

const PASSWORD_RULES = [
  {
    id: "len",
    label: "At least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    id: "upper",
    label: "One uppercase letter",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: "lower",
    label: "One lowercase letter",
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: "num",
    label: "One number",
    test: (value) => /\d/.test(value),
  },
  {
    id: "special",
    label: "One special character",
    test: (value) => /[^A-Za-z0-9]/.test(value),
  },
];

const STRENGTH = [
  { label: "Too weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Fair", bar: "bg-amber-500", text: "text-amber-600" },
  { label: "Good", bar: "bg-lime-500", text: "text-lime-600" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Excellent", bar: "bg-emerald-500", text: "text-emerald-600" },
];

const INITIAL_VALUES = {
  current: "",
  next: "",
  confirm: "",
};

const validationSchema = Yup.object({
  current: Yup.string().required("Enter your current password."),

  next: Yup.string()
    .required("Enter your new password.")
    .min(8, "Password must contain at least 8 characters.")
    .matches(/[A-Z]/, "Password must contain an uppercase letter.")
    .matches(/[a-z]/, "Password must contain a lowercase letter.")
    .matches(/\d/, "Password must contain a number.")
    .matches(/[^A-Za-z0-9]/, "Password must contain a special character.")
    .test(
      "different-password",
      "New password must differ from the current one.",
      function (value) {
        return !value || value !== this.parent.current;
      },
    ),

  confirm: Yup.string()
    .required("Confirm your new password.")
    .oneOf([Yup.ref("next")], "Passwords do not match."),
});

const ChangePasswordModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const formik = useFormik({
    initialValues: INITIAL_VALUES,
    validationSchema,
    onSubmit: async (values, { setStatus }) => {
      try {
        setStatus(undefined);

        await onSubmit({
          currentPassword: values.current,
          newPassword: values.next,
        });
      } catch (error) {
        setStatus(
          error?.message || "Could not change password. Please try again.",
        );
      }
    },
  });

  // Parent loading + Formik submission state
  const isLoading = loading || formik.isSubmitting;

  const passed = useMemo(
    () => PASSWORD_RULES.filter((rule) => rule.test(formik.values.next)).length,
    [formik.values.next],
  );

  const strength = STRENGTH[formik.values.next ? passed : 0];

  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  const getFieldProps = (name) => ({
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: formik.touched[name] && formik.errors[name],
    disabled: isLoading,
    autoComplete: name === "current" ? "current-password" : "new-password",
  });

  return (
    <ModalBasic
      id="change-password"
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title="Password updated"
      description="Use your new password the next time you sign in."
    >
      <form onSubmit={formik.handleSubmit} noValidate>
        <div className="space-y-4 px-6 py-5">
          <InputField
            label="Current password"
            type="password"
            placeholder="Enter current password"
            autoComplete="current-password"
            required
            {...getFieldProps("current")}
          />

          <InputField
            label="New password"
            type="password"
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            {...getFieldProps("next")}
          />

          {formik.values.next && (
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Password strength
                </span>

                <span className={`font-semibold ${strength.text}`}>
                  {strength.label}
                </span>
              </div>

              <div className="mt-1.5 flex gap-1.5">
                {PASSWORD_RULES.map((rule, index) => (
                  <span
                    key={rule.id}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      index < passed
                        ? strength.bar
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          <ul className="grid grid-cols-1 gap-1.5 rounded-xl bg-slate-50 p-3.5 text-xs dark:bg-slate-800/60 sm:grid-cols-2">
            {PASSWORD_RULES.map((rule) => {
              const isValid = rule.test(formik.values.next);

              return (
                <li
                  key={rule.id}
                  className={`flex items-center gap-2 ${
                    isValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      isValid
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    {isValid && <Check size={10} strokeWidth={3} />}
                  </span>

                  {rule.label}
                </li>
              );
            })}
          </ul>

          <InputField
            label="Confirm new password"
            type="password"
            placeholder="Confirm new password"
            autoComplete="new-password"
            required
            {...getFieldProps("confirm")}
          />

          {formik.status && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {formik.status}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-4 dark:border-slate-800 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading && <Loader2 size={16} className="animate-spin" />}

            {isLoading ? "Updating…" : "Update password"}
          </button>
        </div>
      </form>
    </ModalBasic>
  );
};

export default ChangePasswordModal;
