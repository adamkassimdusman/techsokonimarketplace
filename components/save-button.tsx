"use client";
import { useActionState } from "react";
import { Heart } from "lucide-react";
import { favourite, type Result } from "@/app/actions";
export function SaveButton({
  id,
  saved = false,
}: {
  id: string;
  saved?: boolean;
}) {
  const [state, action, pending] = useActionState<Result, FormData>(
    favourite,
    {},
  );
  const active = state.success ? state.success.startsWith("Saved") : saved;
  return (
    <div>
      <form action={action}>
        <input type="hidden" name="listing" value={id} />
        <input type="hidden" name="remove" value={active ? "yes" : "no"} />
        <button
          className="save-button"
          disabled={pending}
          aria-pressed={active}
        >
          <Heart size={16} />
          {pending ? "Saving…" : active ? "Saved" : "Save"}
        </button>
      </form>
      {state.error && (
        <p className="save-feedback" role="alert">
          {state.error}
        </p>
      )}
      <span className="sr-only" role="status">
        {state.success}
      </span>
    </div>
  );
}
