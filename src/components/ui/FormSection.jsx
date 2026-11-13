
import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

const FormSection = ({
  title,
  description,
  icon: Icon,
  children,

  // Collapse behaviour
  collapsible = false,
  defaultOpen = true,
  open: controlledOpen,
  onToggle,

  // Header options
  actions,
  badge,
  showDivider = true,

  // Styling
  className = "",
  headerClassName = "",
  contentClassName = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",

  // Accessibility
  id,
}) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleToggle = () => {
    if (!collapsible) return;

    const nextOpen = !isOpen;

    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onToggle?.(nextOpen);
  };

  const HeaderContent = (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      {Icon && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground ${iconClassName}`}
        >
          <Icon size={19} stroke={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            id={id ? `${id}-title` : undefined}
            className={`text-sm font-semibold text-foreground ${titleClassName}`}
          >
            {title}
          </h3>

          {badge}
        </div>

        {description && (
          <p
            className={`mt-0.5 text-xs leading-relaxed text-muted-foreground ${descriptionClassName}`}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );

  // Non-collapsible sections are always visible.
  const isContentVisible = !collapsible || isOpen;

  return (
    <section
      id={id}
      className={`overflow-hidden rounded-xl border border-border bg-card ${className}`}
    >
      <div
        className={`flex w-full items-center justify-between gap-3 px-5 py-4 ${headerClassName}`}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls={id ? `${id}-content` : undefined}
            aria-labelledby={id ? `${id}-title` : undefined}
            className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {HeaderContent}

            <IconChevronDown
              size={18}
              stroke={1.8}
              className={`shrink-0 text-muted-foreground transition-transform duration-300 ease-in-out ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
        ) : (
          HeaderContent
        )}

        {actions && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* Smooth content transition */}
      <div
        id={id ? `${id}-content` : undefined}
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isContentVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!isContentVisible}
        inert={!isContentVisible}
      >
        <div className="min-h-0 overflow-hidden">
          {showDivider && (
            <div className="border-t border-border" />
          )}

          <div className={`px-5 py-5 ${contentClassName}`}>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormSection;
