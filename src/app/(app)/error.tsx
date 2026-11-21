"use client";

import { RefreshIcon } from "@/components/icons";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card mx-auto max-w-md p-10 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">The error was logged. Please try again.</p>
      <button onClick={reset} className="btn btn-primary mt-6"><RefreshIcon /> Try again</button>
    </div>
  );
}
