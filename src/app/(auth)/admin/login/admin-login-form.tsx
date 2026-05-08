"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Field } from "@/components/ui/input";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: signIn, error: signInErr } =
      await supabase.auth.signInWithPassword({ email, password });

    if (signInErr || !signIn.user) {
      setError(signInErr?.message ?? "Sign-in failed");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signIn.user.id)
      .single();

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account isn't an admin.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 text-ember">
        <Shield className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Admin access
        </span>
      </div>

      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tight">
        Admin sign-in
      </h1>
      <p className="mb-6 text-sm text-fg-muted">
        Borderland street team operations.
      </p>

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
    </div>
  );
}
