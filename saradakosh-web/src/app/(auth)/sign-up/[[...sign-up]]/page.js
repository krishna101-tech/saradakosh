import SignUpView from '@/components/auth/SignUpView';
import { Suspense } from "react";
import { authReturnTo } from "@/lib/auth-return.mjs";
import { authConfiguration } from "@/lib/auth-config.mjs";

export const metadata = { title: "Register", robots: { index: false, follow: false } };

export default async function SignUpPage({ searchParams }) {
  const { mainOrigin, authorizedParties } = authConfiguration();
  const returnTo = authReturnTo((await searchParams).redirect_url, mainOrigin, authorizedParties[1]);
  return <Suspense fallback={<p role="status">Loading registration…</p>}>
    <SignUpView returnTo={returnTo} />
  </Suspense>;
}
