import { createClient } from "@/lib/supabase/server";

export async function signedPhotoUrl(
  path: string | null,
  expiresIn = 60 * 60,
): Promise<string | null> {
  if (!path) return null;
  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("submission-photos")
    .createSignedUrl(path, expiresIn);
  return data?.signedUrl ?? null;
}

export async function signedPhotoUrls(
  paths: (string | null)[],
  expiresIn = 60 * 60,
): Promise<Record<string, string>> {
  const supabase = await createClient();
  const filtered = paths.filter((p): p is string => !!p);
  if (filtered.length === 0) return {};
  const out: Record<string, string> = {};
  await Promise.all(
    filtered.map(async (p) => {
      const { data } = await supabase.storage
        .from("submission-photos")
        .createSignedUrl(p, expiresIn);
      if (data?.signedUrl) out[p] = data.signedUrl;
    }),
  );
  return out;
}
