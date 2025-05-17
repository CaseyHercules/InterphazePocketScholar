"use client";

import { useSearchParams } from "next/navigation";

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-xl font-bold text-red-600">
          Authentication Error
        </h1>
        <div className="mb-4">
          <p className="text-gray-700">
            An error occurred during authentication:
          </p>
          <p className="mt-2 font-mono text-sm text-red-500">{error}</p>
        </div>
        <div className="mt-6">
          <a
            href="/login"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Return to Login
          </a>
        </div>
      </div>
    </div>
  );
}
