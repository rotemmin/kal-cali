import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

export default function ErrorMessage() {
  const { error } = useSignup();

  if (!error) return null;

  return (
    <p className={styles.error}>
      {error}
    </p>
  );
} 