import Link from 'next/link';
import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

export default function LoginLink() {
  const { showEmailForm } = useSignup();
  
  return (
    <p className={`register-question ${styles.registerQuestion} ${showEmailForm ? styles.emailForm : ''}`}>
      כבר יש לך חשבון?{' '}
      <Link href="/login" className={styles.registerLink}>
        התחבר.י כאן!
      </Link>
    </p>
  );
} 