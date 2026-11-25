"use client";
import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActionForm } from "./action-form";
import { sendMessage } from "@/app/actions";
export function MessageComposer({ conversation }: { conversation: string }) {
  const input = useRef<HTMLTextAreaElement>(null);
  return (
    <ActionForm action={sendMessage} label="Send message">
      <input type="hidden" name="conversation" value={conversation} />
      <div className="quick-replies" aria-label="Suggested messages">
        {[
          "Is this laptop still available?",
          "What is your best price?",
          "What is the battery health?",
          "Can I inspect the laptop?",
          "Where are you located?",
          "Does it come with a charger?",
        ].map((t) => (
          <button
            type="button"
            className="chip"
            key={t}
            onClick={() => {
              if (input.current) {
                input.current.value = t;
                input.current.focus();
              }
            }}
          >
            {t}
          </button>
        ))}
      </div>
      <label>
        Your message
        <textarea ref={input} name="body" maxLength={3000} required />
      </label>
    </ActionForm>
  );
}
export function MessageRefresh() {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine)
        router.refresh();
    }, 15000);
    return () => clearInterval(timer);
  }, [router]);
  return (
    <button className="secondary" onClick={() => router.refresh()}>
      Refresh conversation
    </button>
  );
}
