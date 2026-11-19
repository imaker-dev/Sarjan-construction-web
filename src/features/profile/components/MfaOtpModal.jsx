import { useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, X } from "lucide-react";
import OtpInput from "@components/fields/OtpInput";

const MfaOtpModal = ({
  open,
  onClose,
  onSubmit,
  onResend,
  maskedEmail,
  loading = false,
  resending = false,
  expiresInSeconds = 300,
}) => {
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(expiresInSeconds);

  useEffect(() => {
    if (!open) {
      setCode("");
      return undefined;
    }

    setCode("");
    setSeconds(expiresInSeconds);

    const timer = window.setInterval(() => {
      setSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, expiresInSeconds]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (code.length !== 6 || loading) return;

    onSubmit({ code });
  };

  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl">
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <ShieldCheck size={18} />
          </span>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="mt-5 text-lg font-semibold text-slate-900 dark:text-white">
          Verify your email
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Enter the six-digit verification code sent to{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {maskedEmail || "your registered email"}
          </span>
          .
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <OtpInput
            value={code}
            onChange={setCode}
            length={6}
            autoFocus
            disabled={loading}
            idPrefix="mfa-otp"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onResend}
              disabled={resending || loading}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 dark:text-primary-400"
            >
              <RefreshCw
                size={14}
                className={resending ? "animate-spin" : ""}
              />
              Resend code
            </button>

            <span className="text-xs tabular-nums text-slate-400">
              {seconds > 0
                ? `Expires in ${minutes}:${remainingSeconds}`
                : "Code may have expired"}
            </span>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Verify and enable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MfaOtpModal;
