import type { NextConfig } from "next";

// Extract host from NEXT_PUBLIC_SUPABASE_URL without using global URL —
// some TS resolution modes don't see URL in the next.config.ts compile
// context, so a regex keeps us portable.
const supabaseHost = (() => {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const match = raw.match(/^https?:\/\/([^/]+)/);
  return match?.[1];
})();

const config: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default config;
