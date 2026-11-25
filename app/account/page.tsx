import Link from "next/link";
import { ActionForm } from "@/components/action-form";
import { authenticate, resetPassword } from "@/app/actions";
export const metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};
export default async function Account({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const p = await searchParams;
  const register = p.mode === "register";
  return (
    <div className="narrow section">
      <div className="eyebrow">WELCOME TO TECH SOKONI</div>
      <h1>
        {p.reset
          ? "Reset your password"
          : register
            ? "Your next chapter starts here."
            : "Good to see you again."}
      </h1>
      <p>One account to buy, sell and keep your conversations together.</p>
      {p.reset ? (
        <ActionForm action={resetPassword} label="Set new password">
          <input type="hidden" name="token" value={p.reset} />
          <label>
            New password
            <input
              name="password"
              type="password"
              minLength={12}
              maxLength={128}
              autoComplete="new-password"
              required
            />
          </label>
        </ActionForm>
      ) : (
        <ActionForm
          action={authenticate}
          label={register ? "Create account" : "Sign in"}
        >
          <input
            type="hidden"
            name="mode"
            value={register ? "register" : "login"}
          />
          {register && (
            <label>
              Your public name
              <input
                name="name"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
              />
            </label>
          )}
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              autoComplete={register ? "new-password" : "current-password"}
              minLength={12}
              maxLength={128}
              required
            />
            <small>At least 12 characters.</small>
          </label>
        </ActionForm>
      )}
      <p>
        <Link href={register ? "/account" : "/account?mode=register"}>
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </Link>
      </p>
      <details>
        <summary>Forgot your password?</summary>
        <ActionForm action={resetPassword} label="Send reset link">
          <label>
            Email
            <input name="email" type="email" required />
          </label>
        </ActionForm>
      </details>
      <p className="fine">
        Registration does not verify identity or phone ownership. Legal policies
        are drafts pending professional review.
      </p>
    </div>
  );
}
