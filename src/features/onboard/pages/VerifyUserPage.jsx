import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  IconUser,
  IconLock,
  IconShieldCheck,
  IconShieldX,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconClipboardCheck,
} from "@tabler/icons-react";

import PageHeaderBanner from "@components/ui/PageHeaderBanner";
import FormSection from "@components/ui/FormSection";
import { InputField } from "@components/fields/InputField";

import { useQueryParams } from "@hooks/useQueryParams";
import { employeeClaimAccount } from "@store/slices/employee.slice";
import { ROUTES } from "@constants/routes";

const VerifyUserPage = () => {
  const { get } = useQueryParams();
  const token = get("token");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isClaimingEmployeeAccount } = useSelector((state) => state.employee);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  /* -------------------------------------------------------
     VALIDATION
  ------------------------------------------------------- */

  const validate = () => {
    const nextErrors = {};

    if (!token) {
      nextErrors.token = "Invitation token is missing.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must contain at least 8 characters.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /* -------------------------------------------------------
     SUBMIT
  ------------------------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!validate()) return;

    try {
      await dispatch(
        employeeClaimAccount({
          token,
          password,
        }),
      ).unwrap();

      setIsCompleted(true);
    } catch (error) {
      setApiError(
        typeof error === "string"
          ? error
          : error?.message ||
              "Unable to activate your account. Please try again.",
      );
    }
  };

  /* -------------------------------------------------------
     FIELD PROPS
  ------------------------------------------------------- */

  const passwordFieldProps = {
    name: "password",
    label: "Password",
    placeholder: "Create a secure password",
    value: password,
    required: true,
    onChange: (e) => {
      setPassword(e.target.value);
      setErrors((prev) => ({ ...prev, password: "" }));
    },
    error: errors.password,
  };

  const confirmPasswordFieldProps = {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Re-enter your password",
    value: confirmPassword,
    required: true,
    onChange: (e) => {
      setConfirmPassword(e.target.value);
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    },
    error: errors.confirmPassword,
  };

  /* -------------------------------------------------------
     PAGE
  ------------------------------------------------------- */

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <PageHeaderBanner
          title="Activate Employee Account"
          description="Complete your account setup by creating a secure password to access your organization's workspace."
        />

        <div className="mx-auto mt-6">
          {/* SUCCESS STATE */}
          {isCompleted ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <IconCheck size={30} stroke={2} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-slate-800 dark:text-white">
                Account Activated Successfully!
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Your employee account is now active. You can sign in using your
                credentials and access your organization's workspace.
              </p>

              <button
                type="button"
                className="btn btn-primary mt-6"
                onClick={() => navigate(ROUTES.AUTH.LOGIN)}
              >
                Continue to Login
              </button>
            </div>
          ) : !token ? (
            /* INVALID TOKEN */
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-500/10">
                <IconShieldX size={29} stroke={1.8} />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-800 dark:text-white">
                Invitation Link Invalid
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {errors.token ||
                  "Your invitation link is missing or invalid. Please contact your administrator for a new invitation."}
              </p>
            </div>
          ) : (
            <>
              {/* INVITATION STATUS */}
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                <IconShieldCheck
                  size={21}
                  stroke={1.8}
                  className="shrink-0 text-emerald-600 dark:text-emerald-400"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Invitation Link Received
                  </p>

                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-400">
                    Set up your password to activate your employee account.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* ACCOUNT DETAILS */}
                <FormSection
                  title="Account Security"
                  description="Create a password that you will use to sign in to your employee account."
                  icon={IconUser}
                >
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    {/* PASSWORD */}
                    <InputField {...passwordFieldProps} type={"password"} />

                    {/* CONFIRM PASSWORD */}
                    <InputField
                      {...confirmPasswordFieldProps}
                      type={"password"}
                    />
                  </div>

                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    Password must contain at least 8 characters.
                  </p>
                </FormSection>

                {/* API ERROR */}
                {apiError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                    {apiError}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your account will be activated after successful
                    verification.
                  </p>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isClaimingEmployeeAccount}
                  >
                    {isClaimingEmployeeAccount ? (
                      "Activating Account..."
                    ) : (
                      <>
                        <IconClipboardCheck size={17} stroke={1.8} />
                        Verify & Activate Account
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* FOOTER */}
          <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
            Need assistance? Contact your organization administrator.
          </p>
        </div>
      </div>
    </main>
  );
};

export default VerifyUserPage;
