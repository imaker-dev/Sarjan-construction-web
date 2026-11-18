import { useNavigate } from "react-router-dom";

/**
 * 403 / Unauthorized page.
 * Mirrors the layout of the 404 page: illustration, "Oops!!!", message, CTA.
 * Renders inside your existing layout (sidebar + header), so it only fills the content area.
 */

const Illustration = () => (
  <svg
    viewBox="0 0 640 340"
    role="img"
    aria-label="403 access restricted illustration"
    className="h-auto w-full max-w-[280px] sm:max-w-md md:max-w-xl lg:max-w-2xl"
  >
    <defs>
      <linearGradient id="digit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e5e7eb" />
        <stop offset="1" stopColor="#9ca3af" />
      </linearGradient>
      <linearGradient id="lockBody" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
      <pattern
        id="stripes"
        width="28"
        height="28"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <rect width="14" height="28" fill="#1f2937" />
        <rect x="14" width="14" height="28" fill="#fbbf24" />
      </pattern>
    </defs>

    {/* ground shadow */}
    <ellipse cx="320" cy="310" rx="270" ry="14" fill="#000" opacity=".12" />

    {/* "4" */}
    <g
      fill="url(#digit)"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      <path
        d="M60 230 L170 60 L215 60 L215 200 L250 200 L250 245 L215 245 L215 295 L165 295 L165 245 L60 245 Z M165 200 L165 125 L115 200 Z"
        fillRule="evenodd"
      />
    </g>

    {/* "3" */}
    <g
      fill="url(#digit)"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      <path d="M395 70 H535 L475 150 C525 150 560 180 560 225 C560 275 520 298 465 298 C425 298 395 285 380 262 L415 235 C428 250 445 255 465 255 C487 255 505 247 505 228 C505 208 487 198 455 198 H430 L430 160 L478 108 H395 Z" />
    </g>

    {/* padlock acting as the "0" */}
    <g>
      <path
        d="M270 150 V120 C270 90 292 70 320 70 C348 70 370 90 370 120 V150"
        fill="none"
        stroke="#6b7280"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <path
        d="M270 150 V120 C270 90 292 70 320 70 C348 70 370 90 370 120 V150"
        fill="none"
        stroke="url(#digit)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <rect
        x="240"
        y="148"
        width="160"
        height="150"
        rx="22"
        fill="url(#lockBody)"
        stroke="#b45309"
        strokeWidth="4"
      />
      <circle cx="320" cy="205" r="20" fill="#78350f" />
      <rect x="311" y="212" width="18" height="46" rx="6" fill="#78350f" />
    </g>

    {/* caution barrier, left */}
    <g>
      <rect
        x="20"
        y="248"
        width="120"
        height="34"
        rx="4"
        fill="url(#stripes)"
        stroke="#1f2937"
        strokeWidth="3"
      />
      <rect x="34" y="282" width="10" height="26" fill="#4b5563" />
      <rect x="116" y="282" width="10" height="26" fill="#4b5563" />
    </g>

    {/* traffic cone, right */}
    <g>
      <path d="M570 305 L585 230 H605 L620 305 Z" fill="#f97316" />
      <path d="M577 275 H613 L611 262 H579 Z" fill="#fff" />
      <rect x="560" y="302" width="70" height="10" rx="3" fill="#ea580c" />
    </g>

    {/* sign */}
    <g transform="translate(470 150) rotate(4)">
      <rect
        width="130"
        height="86"
        rx="8"
        fill="#111827"
        stroke="#fbbf24"
        strokeWidth="4"
      />
      <text
        x="65"
        y="34"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        fill="#fff"
        fontFamily="inherit"
      >
        NO
      </text>
      <text
        x="65"
        y="58"
        textAnchor="middle"
        fontSize="19"
        fontWeight="800"
        fill="#fff"
        fontFamily="inherit"
      >
        ENTRY
      </text>
      <rect x="10" y="68" width="110" height="10" fill="url(#stripes)" />
    </g>
  </svg>
);

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <section className="flex w-full max-w-lg flex-col items-center text-center">
        <Illustration />

        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
          Oops!!!
        </h1>

        <p className="mt-3 max-w-md text-base text-slate-600 dark:text-slate-300 sm:text-lg">
          You don&apos;t have permission to view this page.
          <span className="block">
            Contact your administrator if you think this is a mistake.
          </span>
        </p>

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="btn btn-primary"
          >
            Go Back to Home
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
          >
            Go Back
          </button>
        </div>
      </section>
    </main>
  );
}
