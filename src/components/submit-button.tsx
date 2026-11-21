"use client";

import { useFormStatus } from "react-dom";

/** A submit button that shows a pending label while its form's Server Action runs. */
export function SubmitButton({ children, pendingLabel, className = "" }: { children: React.ReactNode; pendingLabel: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={`btn btn-primary ${className}`}>
      {pending ? pendingLabel : children}
    </button>
  );
}
