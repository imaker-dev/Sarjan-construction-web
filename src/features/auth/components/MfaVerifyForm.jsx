import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import OtpInput from "@components/fields/OtpInput";
import { logout, verifyMfa } from "@store/slices/auth.slice";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 30;

const formatTime = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/**
 * Second step of login when 2FA is on. Reads the challenge from the auth slice.
 *
 * Optional prop:
 * - onResend(): async, return true when a new code was sent.
 *   The "Resend code" row only shows when this is passed.
 */
export default function MfaVerifyForm({ onResend }) {
  const dispatch = useDispatch();

  const { mfaChallenge, isVerifyingMfa } = useSelector((state) => state.auth);

  const expiresInSeconds = mfaChallenge?.expiresInSeconds || 300;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [expiresIn, setExpiresIn] = useState(expiresInSeconds);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resending, setResending] = useState(false);

  // One ticking timer for the expiry countdown and the resend cooldown
  useEffect(() => {
    const timer = window.setInterval(() => {
      setExpiresIn((s) => Math.max(0, s - 1));
      setCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!mfaChallenge) return null;

  const expired = expiresIn === 0;

  const focusFirst = () => document.getElementById("mfa-otp-0")?.focus();

  const handleChange = (next) => {
    setCode(next);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== CODE_LENGTH || isVerifyingMfa || expired) return;

    const result = await dispatch(
      verifyMfa({
        mfaToken: mfaChallenge.mfaToken,
        code,
        remember: mfaChallenge.remember,
      }),
    );

    if (!verifyMfa.fulfilled.match(result)) {
      setError(result.error?.message || "Invalid or expired code.");
      setCode("");
      focusFirst();
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    const ok = await onResend();
    setResending(false);

    if (ok) {
      setCode("");
      setError("");
      setExpiresIn(expiresInSeconds);
      setCooldown(RESEND_COOLDOWN);
      focusFirst();
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => dispatch(logout())}
        disabled={isVerifyingMfa}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-[#5A6A85] transition hover:text-[#2A3547] disabled:opacity-50 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to sign in
      </button>

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
        <ShieldCheck size={24} />
      </span>

      <h1 className="mt-4 text-[26px] font-bold leading-tight tracking-tight text-[#2A3547] dark:text-white sm:text-[28px]">
        Two-step verification
      </h1>

      <p className="mt-1.5 text-[14.5px] leading-relaxed text-[#5A6A85] dark:text-slate-400">
        We sent a 6-digit verification code to
      </p>
      <p className="text-[15px] font-semibold text-[#2A3547] dark:text-white">
        {mfaChallenge.maskedEmail || "your registered email"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8" noValidate>
        <label className="mb-3 block text-sm font-medium text-[#2A3547] dark:text-slate-200">
          Enter your security code
        </label>

        <OtpInput
          idPrefix="mfa-otp"
          length={CODE_LENGTH}
          value={code}
          onChange={handleChange}
          disabled={isVerifyingMfa}
          error={!!error}
          autoFocus
        />

        <div className="mt-3 min-h-[20px] text-xs" aria-live="polite">
          {error ? (
            <p className="text-red-600">{error}</p>
          ) : expired ? (
            <p className="text-amber-600">
              This code has expired. Go back and sign in again.
            </p>
          ) : (
            <p className="tabular-nums text-slate-400">
              Code expires in {formatTime(expiresIn)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isVerifyingMfa || code.length !== CODE_LENGTH || expired}
          className="btn btn-primary mt-5 w-full"
        >
          {isVerifyingMfa ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify and sign in"
          )}
        </button>

        {onResend && (
          <div className="mt-6 flex flex-wrap items-center gap-x-2 text-sm text-[#5A6A85] dark:text-slate-400">
            <span>Didn't get the code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending || isVerifyingMfa}
              className="inline-flex items-center gap-1.5 font-semibold text-primary-600 transition hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-primary-400"
            >
              <RefreshCw
                size={14}
                className={resending ? "animate-spin" : ""}
              />
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
