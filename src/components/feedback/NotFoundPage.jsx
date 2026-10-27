import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[80dvh] items-center justify-center px-4">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        {/* Illustration */}
        <img
          src="/Images/404-new.webp"
          alt="404 - Page not found"
          className="h-auto w-full max-w-[500px] object-contain"
        />

        {/* Content */}
        <div className="mt-3 sm:mt-4">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#1C2536] dark:text-white sm:text-5xl">
            Oops!!!
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
            This page you are looking for could not be found.
          </p>

          {/* Back Home */}
          <Link
            to="/"
            className="btn-lg mt-7 inline-flex items-center justify-center bg-primary-500 text-white transition-colors hover:bg-primary-600"
          >
            Go Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}