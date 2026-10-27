import React, { useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { IconX } from "@tabler/icons-react";

const ModalBasic = ({
  children,
  id,
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  placement = "center",
  className = "",
}) => {
  const sizes = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    full: "max-w-[calc(100vw-2rem)]",
  };

  const placements = {
    top: "items-start",
    center: "items-center",
    bottom: "items-end",
  };

  const placementAnimation = {
    top: {
      enterFrom: "opacity-0 -translate-y-4 scale-[0.97]",
      enterTo: "opacity-100 translate-y-0 scale-100",
      leaveFrom: "opacity-100 translate-y-0 scale-100",
      leaveTo: "opacity-0 -translate-y-2 scale-[0.98]",
    },

    center: {
      enterFrom: "opacity-0 translate-y-4 scale-[0.97]",
      enterTo: "opacity-100 translate-y-0 scale-100",
      leaveFrom: "opacity-100 translate-y-0 scale-100",
      leaveTo: "opacity-0 translate-y-2 scale-[0.98]",
    },

    bottom: {
      enterFrom: "opacity-0 translate-y-4 scale-[0.97]",
      enterTo: "opacity-100 translate-y-0 scale-100",
      leaveFrom: "opacity-100 translate-y-0 scale-100",
      leaveTo: "opacity-0 translate-y-2 scale-[0.98]",
    },
  };

  const animation = placementAnimation[placement] || placementAnimation.center;

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog id={id} onClose={() => {}} className="relative z-[9999]">
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
          <div
            className="
              fixed inset-0
              bg-slate-950/60
              backdrop-blur-[2px]
              dark:bg-black/55
            "
          />
        </TransitionChild>

        {/* Modal Wrapper */}
        <div className="fixed inset-0 overflow-y-auto">
          <div
            className={`
              flex
              min-h-full
              justify-center
              p-4
              sm:p-6
              ${placements[placement] || placements.center}
            `}
          >
            <TransitionChild
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom={animation.enterFrom}
              enterTo={animation.enterTo}
              leave="ease-in duration-200"
              leaveFrom={animation.leaveFrom}
              leaveTo={animation.leaveTo}
            >
              <DialogPanel
                className={`
                  w-full
                  ${sizes[size]}
                  mx-auto
                  overflow-hidden
                  rounded-2xl
                  bg-dialog
                  text-dialog-foreground
                  shadow-[0_25px_80px_-20px_rgba(0,0,0,0.35)]
                  ring-1 ring-border
                  dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.7)]
                  ${className}
                `}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                  <div className="min-w-0">
                    {title && (
                      <DialogTitle className="text-lg font-semibold leading-6 text-dialog-foreground">
                        {title}
                      </DialogTitle>
                    )}

                    {description && (
                      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>

                  {/* Close Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close modal"
                    className="
                      shrink-0
                      rounded-lg
                      p-1.5
                      text-muted-foreground
                      transition
                      hover:bg-muted
                      hover:text-dialog-foreground
                      focus:outline-none
                      focus:ring-2
                      focus:ring-ring/30
                    "
                  >
                    <IconX size={20} stroke={1.8} />
                  </button>
                </div>

                {/* Content */}
                {children}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalBasic;
