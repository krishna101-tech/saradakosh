import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import ClassesLoginPrompt from './ClassesLoginPrompt';
import styles from './AuthViews.module.css';

export default function SignInView({ returnTo }) {
  const signUpUrl = `/sign-up?${new URLSearchParams({ redirect_url: returnTo })}`;
  return <main className={styles.shell}>
    <Link className={styles.brand} href="/">Saradakosh</Link>
    {new URL(returnTo).pathname.startsWith('/classes') ? <ClassesLoginPrompt returnTo={returnTo} /> : <p className={styles.context}>Use your Saradakosh account to continue.</p>}
    <div className={styles.form}><SignIn routing="path" path="/sign-in" signUpUrl={signUpUrl} forceRedirectUrl={returnTo} /></div>
    <Link href="/">Return to the public archive</Link>
  </main>;
}
