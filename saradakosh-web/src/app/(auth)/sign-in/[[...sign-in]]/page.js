import SignInView from '@/components/auth/SignInView';
import { Suspense } from "react";
import { authReturnTo } from "@/lib/auth-return.mjs";
import { authConfiguration } from "@/lib/auth-config.mjs";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function SignInPage({ searchParams }) {
  const { mainOrigin, authorizedParties } = authConfiguration();
  const returnTo = authReturnTo((await searchParams).redirect_url, mainOrigin, authorizedParties[1]);
  return <Suspense fallback={<p role="status">Loading sign in…</p>}>
    <SignInView returnTo={returnTo} />
  </Suspense>;
}
