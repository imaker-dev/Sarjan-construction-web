import { APP_CONFIG } from "@config/app.config";
import { useSelector } from "react-redux";
import MfaVerifyForm from "../components/MfaVerifyForm";
import LoginForm from "../components/LoginForm";

const LOGIN_IMAGE = "/Images/login-illustration.webp";
const MFA_IMAGE = "/Images/two-step-illustration.svg"; // your shield illustration

/* ============================================================================
   BRAND PANEL
============================================================================ */
function BrandPanel({
  className = "",
  imgClassName = "w-28",
  mobile = false,
  image = LOGIN_IMAGE,
}) {
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
          src={image}
          alt=""
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
   LOGIN PAGE
============================================================================ */
export default function LoginPage() {
  const { mfaChallenge } = useSelector((state) => state.auth);

  const brandImage = mfaChallenge ? MFA_IMAGE : LOGIN_IMAGE;

  return (
    <div className="min-h-dvh w-full flex flex-col md:flex-row bg-background transition-colors duration-300">
      {/* Mobile Brand Panel */}
      <BrandPanel
        mobile
        image={brandImage}
        className="md:hidden w-full shrink-0 h-[320px] sm:h-[360px]"
        imgClassName="w-32"
      />

      {/* Desktop Brand Panel */}
      <BrandPanel
        image={brandImage}
        className="hidden md:block md:w-1/2 lg:w-[65%] min-h-screen"
        imgClassName="w-48 lg:w-56"
      />

      {/* Form column */}
      <div className="flex-1 md:w-1/2 lg:w-[35%] flex items-start md:items-center justify-center px-6 sm:px-10 py-8 md:py-10 bg-white dark:bg-[#0B1120] transition-colors duration-300">
        <div className="w-full max-w-[400px]">
          {mfaChallenge ? (
            <MfaVerifyForm key={mfaChallenge.mfaToken} />
          ) : (
            <LoginForm />
          )}
        </div>
      </div>
    </div>
  );
}
