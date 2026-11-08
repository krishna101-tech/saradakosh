'use client';

import Link from 'next/link';
import { Show, UserButton, useAuth } from '@clerk/nextjs';
import styles from './AuthViews.module.css';

// Display only. Classes and Blog access are enforced by server resource guards.
export default function HeaderAuthStatus() {
  const { isLoaded } = useAuth();
  return <nav className={styles.account} aria-label="Account">
    {!isLoaded ? <span aria-live="polite">Loading account…</span> : <>
      <Show when="signed-out"><Link prefetch={false} href="/sign-in">Sign in</Link><Link prefetch={false} href="/sign-up">Register</Link></Show>
      <Show when="signed-in"><UserButton /></Show>
    </>}
  </nav>;
}
