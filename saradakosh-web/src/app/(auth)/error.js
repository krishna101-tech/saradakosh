'use client';

import Link from 'next/link';
import styles from '@/components/auth/AuthViews.module.css';

export default function AuthenticationError({ reset }) {
  return <main className={styles.shell}>
    <h1>Sign-in is temporarily unavailable</h1>
    <p role="alert">Please try again in a moment.</p>
    <button className={styles.retry} type="button" onClick={reset}>Try again</button>
    <Link href="/">Return to the public archive</Link>
  </main>;
}
