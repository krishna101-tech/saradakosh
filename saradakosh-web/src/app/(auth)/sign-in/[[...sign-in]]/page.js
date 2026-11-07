import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default function SignInPage() {
  return <main><Suspense fallback={<p>Loading sign in…</p>}>
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/classes" />
  </Suspense></main>;
}
