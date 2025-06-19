import Link from 'next/link';
import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

interface LoginLinkProps {
  variant?: 'emailForm' | 'mainScreen';
}

export default function LoginLink({ variant = 'emailForm' }: LoginLinkProps) {
  const { showEmailForm } = useSignup();
  
  const getClassName = () => {
    const baseClass = `register-question ${styles.registerQuestion}`;
    if (variant === 'mainScreen') {
      return `${baseClass} ${styles.mainScreen}`;
    }
    return `${baseClass} ${showEmailForm ? styles.emailForm : ''}`;
  };
  
  return (
    <p className={getClassName()}>
      כבר יש לך חשבון?{' '}
      <Link href="/login" className={styles.registerLink}>
        התחבר.י כאן!
      </Link>
    </p>
  );
} 