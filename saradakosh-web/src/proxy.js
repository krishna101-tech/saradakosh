import { clerkMiddleware } from "@clerk/nextjs/server";
import { authConfiguration } from "@/lib/auth-config.mjs";

// Identity foundation only. Resource authorization is implemented in CDX-M1-02.
export default clerkMiddleware(authConfiguration());

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
