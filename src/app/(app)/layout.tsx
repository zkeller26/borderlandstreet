import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/header";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Admins don't see the ambassador dashboard — kick them to /admin
  if ((profile as Profile | null)?.role === "admin") redirect("/admin");

  return (
    <div className="min-h-dvh">
      <AppHeader profile={(profile as Profile | null) ?? null} />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:py-8">
        {children}
      </main>
    </div>
  );
}
