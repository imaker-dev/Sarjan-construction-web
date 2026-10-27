import React, { useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { X } from "lucide-react";
import { IconLoader } from "@tabler/icons-react";

const THEMES = {
  danger: {
    icon: "bg-danger-50 text-danger-500 ring-danger-500/15 dark:bg-danger-950/30 dark:text-danger-400 dark:ring-danger-500/20",
    button:
      "bg-danger-500 hover:bg-danger-600 active:bg-danger-700 focus-visible:ring-danger-500/25",
  },
  primary: {
    icon: "bg-primary-50 text-primary-500 ring-primary-500/15 dark:bg-primary-950/30 dark:text-primary-400 dark:ring-primary-500/20",
    button:
      "bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500/25",
  },
  success: {
    icon: "bg-success-50 text-success-500 ring-success-500/15 dark:bg-success-950/30 dark:text-success-400 dark:ring-success-500/20",
    button:
      "bg-success-500 hover:bg-success-600 active:bg-success-700 focus-visible:ring-success-500/25",
  },
  warning: {
    icon: "bg-warning-50 text-warning-500 ring-warning-500/15 dark:bg-warning-950/30 dark:text-warning-400 dark:ring-warning-500/20",
    button:
      "bg-warning-500 hover:bg-warning-600 active:bg-warning-700 focus-visible:ring-warning-500/25",
  },
  info: {
    icon: "bg-info-50 text-info-500 ring-info-500/15 dark:bg-info-950/30 dark:text-info-400 dark:ring-info-500/20",
    button:
      "bg-info-500 hover:bg-info-600 active:bg-info-700 focus-visible:ring-info-500/25",
  },
};

export default function ModalAction({
  isOpen,
  onClose,
  onSubmit,
  id = "modal-action",
  title,
  desc,
  children,
  icon: Icon,
  theme = "primary",
  submitText = "Confirm",
  loadingText = "Processing...",
  cancelText = "Cancel",
  loading = false,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showClose = true,
  showCancel = true,
  submitDisabled = false,
  size = "md",
  className = "",
}) {
  const themeConfig = THEMES[theme] || THEMES.primary;

  const sizes = {
    xs: "sm:max-w-xs",
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !loading) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeOnEscape, loading, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const handleClose = () => {
    if (!loading) onClose?.();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        id={id}
        onClose={closeOnBackdrop ? handleClose : () => {}}
        className="relative z-[9999]"
      >
        {/* Backdrop */}
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/50" />
        </TransitionChild>

        {/* Modal Position */}
        <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-full sm:translate-y-4 sm:scale-[0.97]"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-full sm:translate-y-2 sm:scale-[0.98]"
          >
            <DialogPanel
              className={`relative w-full overflow-hidden rounded-t-[20px] border border-border bg-card text-card-foreground shadow-[0_-20px_50px_-12px_rgba(15,23,42,0.25)] dark:shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:shadow-[0_28px_70px_-15px_rgba(15,23,42,0.3)] ${sizes[size]} ${className}`}
            >
              {/* Mobile Drag Handle */}
              <div className="flex justify-center pt-2.5 sm:hidden">
                <div className="h-1 w-9 rounded-full bg-border" />
              </div>

              {/* Close */}
              {showClose && (
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </button>
              )}

              {/* Content */}
              <div className="px-6 pb-6 pt-6 sm:px-7 sm:pb-6 sm:pt-7">
                {/* Header */}
                <div className="flex items-start gap-3.5 pr-7">
                  {Icon && (
                    <div
                      className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ring-1 ${themeConfig.icon}`}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                  )}

                  <div className={`min-w-0 ${Icon ? "pt-0.5" : ""}`}>
                    <h2
                      id={`${id}-title`}
                      className="text-[16px] font-semibold tracking-[-0.01em] text-foreground"
                    >
                      {title}
                    </h2>

                    {desc && (
                      <p
                        id={`${id}-desc`}
                        className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground"
                      >
                        {desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Custom Content */}
                {children && <div className="mt-4">{children}</div>}

                {/* Divider */}
                <div className="mt-6 border-t border-border" />

                {/* Actions */}
                <div
                  className={`mt-5 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end ${
                    !showCancel ? "sm:justify-end" : ""
                  }`}
                >
                  {showCancel && (
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      className="btn border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {cancelText}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onSubmit?.()}
                    disabled={loading || submitDisabled}
                    className={`btn text-white shadow-sm focus:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 ${themeConfig.button}`}
                  >
                    {loading && (
                      <IconLoader className="w-4 h-4 animate-spin mr-2" />
                    )}

                    {loading ? loadingText : submitText}
                  </button>
                </div>

                {/* iOS Safe Area */}
                <div className="pb-[env(safe-area-inset-bottom)] sm:hidden" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
