import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { authConfiguration } from "@/lib/auth-config.mjs";
import { classesReturnTo } from "@/lib/classes-return.mjs";

const privateHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export default clerkMiddleware(async (auth, request) => {
  const { pathname, search, searchParams } = request.nextUrl;
  if (pathname !== "/classes" && !pathname.startsWith("/classes/")) return NextResponse.next();

  const session = await auth();
  let response;
  if (!session.userId) {
    const documentRequest = ["GET", "HEAD"].includes(request.method) &&
      !request.headers.get("accept")?.includes("text/x-component") &&
      request.headers.get("rsc") !== "1" &&
      !request.headers.has("next-router-prefetch") &&
      !request.headers.has("next-action") && !searchParams.has("_rsc");
    response = documentRequest
      ? session.redirectToSignIn({
        returnBackUrl: classesReturnTo(`${pathname}${search}`, authConfiguration().mainOrigin),
      })
      : new NextResponse("Authentication required.", { status: 401 });
  } else {
    response = NextResponse.next();
  }
  for (const [name, value] of Object.entries(privateHeaders)) response.headers.set(name, value);
  return response;
}, authConfiguration());

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
