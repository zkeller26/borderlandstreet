import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip middleware for static files (including embed.js and other public
  // assets). Without listing .js / .css here the matcher catches /embed.js
  // and the auth gate redirects it to /login, breaking the Webflow embed.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|woff|woff2|ttf|otf|json|xml|txt|ico)$).*)",
  ],
};
