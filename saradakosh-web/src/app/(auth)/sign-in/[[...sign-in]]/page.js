import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import { authReturnTo } from "@/lib/auth-return.mjs";
import { authConfiguration } from "@/lib/auth-config.mjs";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }) {
  const { mainOrigin, authorizedParties } = authConfiguration();
  const returnTo = authReturnTo((await searchParams).redirect_url, mainOrigin, authorizedParties[1]);
  return <main><Suspense fallback={<p>Loading sign in…</p>}>
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl={returnTo} />
  </Suspense></main>;
}
