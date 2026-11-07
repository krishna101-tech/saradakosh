import Link from 'next/link';
import styles from './AuthViews.module.css';

// returnTo is supplied only by the server's authReturnTo policy.
export default function ClassesLoginPrompt({ returnTo }) {
  return <aside className={styles.context}>
    <p>Sign in to browse Morning Class lessons and transcripts.</p>
    <p>New here? <Link href={{ pathname: '/sign-up', query: { redirect_url: returnTo } }}>Create an account</Link>.</p>
  </aside>;
}
