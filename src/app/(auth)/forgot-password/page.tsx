"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-2 text-sm text-fg-muted">
          We sent a password reset link to{" "}
          <span className="text-fg">{email}</span>. Tap the link, then come
          back to set a new password.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center gap-1 text-sm text-ember hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">
        Reset password
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Enter your email and we'll send you a link to set a new one.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-fg-muted">
        Remembered it?{" "}
        <Link href="/login" className="text-ember hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
