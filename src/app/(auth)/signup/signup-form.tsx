"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Field, Textarea } from "@/components/ui/input";
import { TargetAreasInput } from "@/components/ui/target-areas-input";
import { ChipList } from "@/components/ui/chip-list";

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [targetAreas, setTargetAreas] = useState<string[]>([]);
  const [flyerEvents, setFlyerEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (targetAreas.length === 0) {
      setError("Pick at least one target area.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: err, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`.trim(),
          phone,
          shipping_address: shippingAddress,
          target_areas: targetAreas,
          flyer_events: flyerEvents,
        },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.href = "/dashboard";
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <h2 className="mb-2 font-display text-xl font-semibold">
          Check your email
        </h2>
        <p className="text-sm text-fg-muted">
          Tap the confirmation link, then come back to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name">
          <Input
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="Email">
        <Input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>

      <Field label="Password" hint="6+ characters">
        <Input
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>

      <Field label="Phone number">
        <Input
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(716) 555-0142"
        />
      </Field>

      <Field label="Shipping address" hint="for posters & flyers">
        <Textarea
          required
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder={"123 Main St, Apt 4\nBuffalo, NY 14201"}
        />
      </Field>

      <Field label="Target areas" hint="select all that apply">
        <TargetAreasInput value={targetAreas} onChange={setTargetAreas} />
      </Field>

      <Field
        label="Concerts / events you can flyer at"
        hint="add one at a time"
      >
        <ChipList
          values={flyerEvents}
          onChange={setFlyerEvents}
          placeholder='e.g. "Lord Huron at Asbury"'
        />
      </Field>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
