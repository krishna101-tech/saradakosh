import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";
import { classesReturnTo } from "@/lib/classes-return.mjs";
import { authConfiguration } from "@/lib/auth-config.mjs";

export const metadata = { title: "Register", robots: { index: false, follow: false } };

export default async function SignUpPage({ searchParams }) {
  const returnTo = classesReturnTo((await searchParams).redirect_url, authConfiguration().mainOrigin);
  return <main><Suspense fallback={<p>Loading registration…</p>}>
    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl={returnTo} />
  </Suspense></main>;
}
