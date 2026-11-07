import Link from 'next/link';
import { SignUp } from '@clerk/nextjs';
import styles from './AuthViews.module.css';

export default function SignUpView({ returnTo }) {
  const signInUrl = `/sign-in?${new URLSearchParams({ redirect_url: returnTo })}`;
  return <main className={styles.shell}>
    <Link className={styles.brand} href="/">Saradakosh</Link>
    <p className={styles.context}>Create your Saradakosh account to access Morning Class lessons.</p>
    <div className={styles.form}><SignUp routing="path" path="/sign-up" signInUrl={signInUrl} forceRedirectUrl={returnTo} /></div>
    <Link href="/">Return to the public archive</Link>
  </main>;
}
