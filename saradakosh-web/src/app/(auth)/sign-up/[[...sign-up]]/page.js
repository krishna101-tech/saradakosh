import { SignUp } from "@clerk/nextjs";
import { Suspense } from "react";

export const metadata = { title: "Register", robots: { index: false, follow: false } };

export default function SignUpPage() {
  return <main><Suspense fallback={<p>Loading registration…</p>}>
    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/classes" />
  </Suspense></main>;
}
