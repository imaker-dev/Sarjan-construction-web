import { useNavigate } from "react-router-dom";

/**
 * 403 / Unauthorized page.
 * Mirrors the layout of the 404 page: illustration, "Oops!!!", message, CTA.
 * Renders inside your existing layout (sidebar + header), so it only fills the content area.
 */

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {/* Illustration */}
        <img
          src="/Images/401.webp"
          alt="401 - Unauthorized"
          className="h-auto w-full max-w-[500px] object-contain"
        />

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
      </div>
    </main>
  );
}
