import { useFormik } from "formik";
import * as Yup from "yup";
import { Loader2, Lock, LogIn, UserIcon } from "lucide-react";
import { APP_CONFIG } from "@config/app.config";
import { InputField } from "@components/fields/InputField";
import { useDispatch, useSelector } from "react-redux";
import { handleResponse } from "@utils/async.utils";
import { login } from "@store/slices/auth.slice";

/* ============================================================================
   BRAND PANEL
============================================================================ */
function BrandPanel({ className = "", imgClassName = "w-28", mobile = false }) {
  return (
    <div
      className={`relative overflow-hidden bg-[#F3F5F9] dark:bg-[#111827] ${className}`}
    >
      <div
        className={`absolute z-20 ${mobile ? "top-5 left-5" : "top-6 left-6"}`}
      >
        <img
          src={APP_CONFIG.LOGO}
          alt={`${APP_CONFIG.APP_NAME} logo`}
          className={imgClassName}
        />
      </div>

      <div
        className={
          mobile
            ? "absolute inset-x-0 bottom-2 flex items-end justify-center"
            : "absolute inset-0 flex items-center justify-center"
        }
      >
        <img
          src="/Images/login-illustration.webp"
          alt="Login illustration"
          className={
            mobile
              ? "w-[88%] max-w-[300px] h-auto max-h-[235px] object-contain"
              : "w-[70%] max-w-[700px] max-h-[75%] object-contain"
          }
        />
      </div>
    </div>
  );
}

/* ============================================================================
   VALIDATION SCHEMA
============================================================================ */
const validationSchema = Yup.object({
  username: Yup.string().trim().required("Please enter your username"),
  password: Yup.string().required("Please enter your password"),
  remember: Yup.boolean(),
});

/* ============================================================================
   LOGIN PAGE
============================================================================ */
export default function LoginPage({ onForgotPassword }) {
  const dispatch = useDispatch();

  const { isLoggingIn } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      remember: false,
    },

    validationSchema,

    onSubmit: async (values) => {
      const payload = {
        loginId: values.username.trim(),
        password: values.password,
        remember: values.remember,
      };

      await handleResponse(dispatch(login(payload)), async (res) => {});
    },
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = formik;

  return (
    <div className="min-h-dvh w-full flex flex-col md:flex-row bg-background transition-colors duration-300">
      {/* Mobile Brand Panel */}
      <BrandPanel
        mobile
        className="md:hidden w-full shrink-0 h-[320px] sm:h-[360px]"
        imgClassName="w-32"
      />

      {/* Desktop Brand Panel */}
      <BrandPanel
        className="hidden md:block md:w-1/2 lg:w-[65%] min-h-screen"
        imgClassName="w-48 lg:w-56"
      />

      {/* Login Form */}
      <div className="flex-1 md:w-1/2 lg:w-[35%] flex items-start md:items-center justify-center px-6 sm:px-10 py-8 md:py-10 bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#2A3547] dark:text-white leading-tight tracking-tight">
            Welcome to {APP_CONFIG.APP_NAME}
          </h1>

          <p className="mt-1.5 text-[14.5px] text-[#5A6A85] dark:text-slate-400">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            {/* Username */}
            <InputField
              label="Username"
              name="username"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="username"
              required
              error={touched.username ? errors.username : undefined}
              icon={UserIcon}
            />

            {/* Password */}
            <InputField
              label="Password"
              name="password"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              required
              error={touched.password ? errors.password : undefined}
              icon={Lock}
            />

            {/* Remember Device */}
            <div className="flex items-center justify-between flex-wrap gap-y-2">
              <label className="form-check cursor-pointer">
                <input
                  type="checkbox"
                  name="remember"
                  className="form-checkbox"
                  checked={values.remember}
                  onChange={(e) => setFieldValue("remember", e.target.checked)}
                />

                <span className="text-[#5A6A85] dark:text-slate-300">
                  Remember this device
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoggingIn}
              className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
