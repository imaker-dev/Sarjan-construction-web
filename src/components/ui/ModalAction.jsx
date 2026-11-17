import React, { useEffect, useRef } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
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

const SIZES = {
  xs: "sm:max-w-xs",
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
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
  const escapePressed = useRef(false);

  // Headless UI already handles Escape + body scroll lock. We only track
  // whether a close request came from the Escape key, so that
  // `closeOnEscape` and `closeOnBackdrop` can be controlled independently.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        escapePressed.current = true;
        setTimeout(() => {
          escapePressed.current = false;
        }, 0);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const handleClose = () => {
    if (!loading) onClose?.();
  };

  const handleDialogClose = () => {
    if (loading) return;

    if (escapePressed.current) {
      if (closeOnEscape) onClose?.();
      return;
    }

    if (closeOnBackdrop) onClose?.();
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        id={id}
        onClose={handleDialogClose}
        className="relative z-[9999]"
      >
        {/* Backdrop */}
        <TransitionChild
          as={React.Fragment}
          enter="ease-out duration-300 motion-reduce:duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200 motion-reduce:duration-0"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] dark:bg-black/50" />
        </TransitionChild>

        {/* Modal Position */}
        <div className="fixed inset-0 flex items-end justify-center sm:items-center sm:p-6">
          <TransitionChild
            as={React.Fragment}
            enter="ease-out duration-300 motion-reduce:duration-0"
            enterFrom="opacity-0 translate-y-full sm:translate-y-4 sm:scale-[0.97]"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200 motion-reduce:duration-0"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-full sm:translate-y-2 sm:scale-[0.98]"
          >
            <DialogPanel
              className={`relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[20px] border border-border bg-card text-card-foreground shadow-[0_-20px_50px_-12px_rgba(15,23,42,0.25)] dark:shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:shadow-[0_28px_70px_-15px_rgba(15,23,42,0.3)] ${SIZES[size] || SIZES.md} ${className}`}
            >
              {/* Mobile Drag Handle */}
              <div className="flex flex-none justify-center pt-2.5 sm:hidden">
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

              {/* Body (scrolls if content is tall) */}
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-6 sm:px-7 sm:pt-7">
                {/* Header */}
                <div className="flex items-start gap-3.5 pr-7">
                  {Icon && (
                    <div
                      className={`flex h-10 w-10 flex-none items-center justify-center rounded-full ring-1 ${themeConfig.icon}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </div>
                  )}

                  <div className={`min-w-0 ${Icon ? "pt-0.5" : ""}`}>
                    <DialogTitle
                      as="h2"
                      className="text-[16px] font-semibold tracking-[-0.01em] text-foreground"
                    >
                      {title}
                    </DialogTitle>

                    {desc && (
                      <Description
                        as="p"
                        className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground"
                      >
                        {desc}
                      </Description>
                    )}
                  </div>
                </div>

                {/* Custom Content */}
                {children && <div className="mt-4">{children}</div>}
              </div>

              {/* Footer: full width, edge-to-edge divider */}
              <div className="flex flex-none flex-col-reverse gap-2.5 border-t border-border bg-muted/30 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-end sm:px-7 sm:pb-4">
                {showCancel && (
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    autoFocus={theme === "danger"}
                    className="btn w-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 sm:w-auto sm:min-w-[96px]"
                  >
                    {cancelText}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSubmit?.()}
                  disabled={loading || submitDisabled}
                  className={`btn w-full text-white shadow-sm focus:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[96px] ${themeConfig.button}`}
                >
                  {loading && (
                    <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {loading ? loadingText : submitText}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}