"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

export function LoginForm({
  next,
  headingless = false,
  hideSignupLink = false,
}: {
  next: string;
  /** Skip the "Welcome back" h1 + subtitle (when parent provides them) */
  headingless?: boolean;
  /** Skip the bottom "New ambassador? Create an account" link */
  hideSignupLink?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: signIn, error: err } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (err || !signIn.user) {
      setError(err?.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signIn.user.id)
      .single();

    window.location.href =
      profile?.role === "admin" ? "/admin" : next || "/dashboard";
  }

  return (
    <div>
      {!headingless && (
        <>
          <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mb-6 text-sm text-fg-muted">
            Sign in to log your street team work.
          </p>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Email">
          <Input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password">
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-fg-muted hover:text-ember"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      {!hideSignupLink && (
        <p className="mt-6 text-center text-sm text-fg-muted">
          New ambassador?{" "}
          <Link href="/signup" className="text-ember hover:underline">
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}
