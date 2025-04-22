import Link from 'next/link';
import styles from './page.module.css';

export default function LoginLink() {
  return (
    <p className={styles.loginLink}>
      כבר יש לך חשבון?{' '}
      <Link href="/login">
        התחבר כאן
      </Link>
    </p>
  );
} 