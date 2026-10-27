import { useFormik } from "formik";
import * as Yup from "yup";
import { APP_CONFIG } from "@config/app.config";
import { InputField } from "@components/fields/InputField";

/* ============================================================================
   BRAND PANEL
============================================================================ */
function BrandPanel({ className = "", imgClassName = "w-28", mobile = false }) {
  return (
    <div className={`relative overflow-hidden bg-[#F3F5F9] ${className}`}>
      <div
        className={`absolute z-20 ${mobile ? "top-5 left-5" : "top-6 left-6"}`}
      >
        <img
          src={APP_CONFIG.LOGO}
          alt={`${APP_CONFIG.APP_NAME} logo`}
          className={imgClassName}
        />
      </div>
      {/* 
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/Images/login-illustration.webp"
          alt="Login illustration"
          className={
            mobile
              ? "w-[92%] max-w-[420px] h-auto max-h-[270px] object-contain"
              : "w-[70%] max-w-[700px] max-h-[75%] object-contain"
          }
        />
      </div> */}

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
              ? "w-[88%] max-w-[380px] h-auto max-h-[235px] object-contain"
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
  username: Yup.string().trim().required("Username is required"),
  password: Yup.string().required("Password is required"),
  remember: Yup.boolean(),
});

/* ============================================================================
   LOGIN PAGE
============================================================================ */
export default function LoginPage({ onSubmit }) {
  const formik = useFormik({
    initialValues: { username: "", password: "", remember: false },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit?.(values);
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
    <div className="min-h-dvh w-full flex flex-col md:flex-row bg-white">
      {/* Mobile brand panel */}

      <BrandPanel
        mobile
        className="md:hidden w-full shrink-0 h-[320px] sm:h-[360px]"
        imgClassName="w-32"
      />

      {/* Desktop brand panel */}

      <BrandPanel
        className="hidden md:block md:w-1/2 lg:w-[65%] min-h-screen"
        imgClassName="w-48 lg:w-56"
      />

      {/* Form panel */}
      <div className="flex-1 md:w-1/2 lg:w-[35%] flex items-start md:items-center justify-center px-6 sm:px-10 py-8 md:py-10">
        <div className="w-full max-w-[400px]">
          <h1 className="text-[26px] sm:text-[28px] font-bold text-[#2A3547] leading-tight">
            Welcome to {APP_CONFIG.APP_NAME}
          </h1>

          <p className="mt-1.5 text-[14.5px] text-[#5A6A85]">
            Sign in to your dashboard
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
            <InputField
              label="Username"
              name="username"
              id="username"
              type="text"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="username"
              required
              error={touched.username ? errors.username : undefined}
            />

            <InputField
              label="Password"
              name="password"
              id="password"
              type="password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="current-password"
              required
              error={touched.password ? errors.password : undefined}
            />

            <div className="flex items-center justify-between flex-wrap gap-y-2">
              <label className="form-check">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={values.remember}
                  onChange={(checked) => setFieldValue("remember", checked)}
                />
                <span>Remember this device</span>
              </label>

              <a
                href="#"
                className="text-[14px] font-medium text-primary-500 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="btn w-full btn-primary"
              // className="w-full btn bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
