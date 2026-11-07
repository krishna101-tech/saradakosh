import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { classesReturnTo } from "@/lib/classes-return.mjs";
import { authConfiguration } from "@/lib/auth-config.mjs";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }) {
  const returnTo = classesReturnTo((await searchParams).redirect_url, authConfiguration().mainOrigin);
  return <main><Suspense fallback={<p>Loading sign in…</p>}>
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl={returnTo} />
  </Suspense></main>;
}
