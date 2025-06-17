import Link from 'next/link';
import styles from './page.module.css';

export default function LoginLink() {
  return (
    <p className={`register-question ${styles.registerQuestion}`}>
      כבר יש לך חשבון?{' '}
      <Link href="/login" className={styles.registerLink}>
        התחבר.י כאן!
      </Link>
    </p>
  );
} 