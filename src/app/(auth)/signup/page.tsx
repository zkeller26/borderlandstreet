import { LoginForm } from "../login/login-form";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="space-y-10">
      {/* ── LOG-IN (shown first so returning users land here) ─────────── */}
      <section>
        <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">
          Sign in
        </h1>
        <p className="mb-5 text-sm text-fg-muted">
          Returning ambassador? Log in to track your progress.
        </p>
        <LoginForm next="/dashboard" headingless hideSignupLink />
      </section>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="relative">
        <div className="border-t border-border" />
        <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-3 text-[10px] uppercase tracking-wider text-fg-subtle">
          New here?
        </p>
      </div>

      {/* ── SIGN-UP (below the divider) ──────────────────────────────── */}
      <section>
        <h2 className="mb-1 font-display text-2xl font-semibold tracking-tight">
          Join the street team
        </h2>
        <p className="mb-5 text-sm text-fg-muted">
          Earn your free Borderland ticket, get valuable festival experience,
          and network with industry experts!
        </p>
        <SignupForm />
      </section>
    </div>
  );
}
