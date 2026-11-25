"use client";
import { useActionState } from "react";
import type { Result } from "@/app/actions";
export function ActionForm({
  action,
  children,
  label = "Save",
  className = "",
}: {
  action: (state: Result, data: FormData) => Promise<Result>;
  children?: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [state, submit, pending] = useActionState(action, {});
  return (
    <form action={submit} className={"action-form " + className}>
      {children}
      <button disabled={pending} type="submit">
        {pending ? "Please wait…" : label}
      </button>
      {state.error && (
        <p className="error" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="success" role="status">
          {state.success}
        </p>
      )}
    </form>
  );
}
