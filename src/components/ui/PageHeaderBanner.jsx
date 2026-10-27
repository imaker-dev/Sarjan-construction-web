import { NavLink, useLocation } from "react-router-dom";

const formatBreadcrumb = (segment) =>
  segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export default function PageHeaderBanner({
  title,
  description = "",
  image = "/Images/breadcrumb.webp",
  imageAlt = "",
  className = "",
}) {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <section
      className={`
        relative h-[70px] overflow-hidden rounded-md
        bg-gradient-to-r
        from-primary-100 via-primary-50 to-secondary-100
        dark:from-primary-950 dark:via-primary-950 dark:to-secondary-950
        sm:h-[76px]
        md:h-[80px] md:rounded-xl
        lg:h-[82px]
        ${className}
      `}
    >
      {/* Content */}
      <div
        className="
          relative z-10 flex h-full max-w-[72%] flex-col justify-center
          px-4
          sm:max-w-[68%] sm:px-5
          md:px-6
          lg:px-7
        "
      >
        {/* Title */}
        <h1
          className="
            truncate text-base font-semibold tracking-tight
            text-slate-800
            dark:text-white
            sm:text-lg
            md:text-xl
          "
        >
          {title}
        </h1>

        {/* Description / Breadcrumb */}
        {description ? (
          <p
            className="
              mt-0.5 truncate
              text-[11px] leading-4
              text-slate-600
              dark:text-slate-300
              sm:text-xs
              md:text-sm
            "
          >
            {description}
          </p>
        ) : (
          <nav aria-label="Breadcrumb" className="mt-0.5">
            <ol
              className="
                flex flex-wrap items-center gap-x-1.5
                text-[11px]
                sm:text-xs
                md:text-sm
              "
            >
              {/* Dashboard */}
              <li>
                <NavLink
                  to="/dashboard"
                  className="
                    text-slate-600
                    transition-colors
                    hover:text-primary-600
                    dark:text-slate-400
                    dark:hover:text-primary-300
                  "
                >
                  Dashboard
                </NavLink>
              </li>

              {/* Current Route */}
              {segments.map((segment, index) => {
                const path = `/${segments.slice(0, index + 1).join("/")}`;
                const isLast = index === segments.length - 1;

                return (
                  <li
                    key={path}
                    className="flex min-w-0 items-center gap-1.5"
                  >
                    {/* Separator */}
                    <span
                      className="
                        text-slate-400
                        dark:text-slate-600
                      "
                      aria-hidden="true"
                    >
                      •
                    </span>

                    {isLast ? (
                      <span
                        className="
                          max-w-[120px]
                          truncate
                          text-slate-700
                          dark:text-slate-200
                          sm:max-w-[180px]
                        "
                        aria-current="page"
                      >
                        {formatBreadcrumb(segment)}
                      </span>
                    ) : (
                      <NavLink
                        to={path}
                        className="
                          text-slate-600
                          transition-colors
                          hover:text-primary-600
                          dark:text-slate-400
                          dark:hover:text-primary-300
                        "
                      >
                        {formatBreadcrumb(segment)}
                      </NavLink>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>

      {/* Illustration */}
      {image && (
        <div
          className="
            pointer-events-none
            absolute bottom-0 right-2
            h-[58px] w-[85px]
            sm:right-3
            sm:h-[65px] sm:w-[105px]
            md:right-5
            md:h-[72px] md:w-[125px]
            lg:right-6
            lg:h-[76px] lg:w-[140px]
          "
          aria-hidden={!imageAlt}
        >
          <img
            src={image}
            alt={imageAlt}
            className="
              h-full
              w-full
              object-contain
              object-right-bottom
            "
          />
        </div>
      )}
    </section>
  );
}