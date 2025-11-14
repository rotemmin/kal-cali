import styles from './page.module.css';
import { useSignup } from '@/context/SignupContext';

export default function IntroText() {
  const { signupMethod, showEmailForm } = useSignup();
  
  if (!showEmailForm) {
    return (
      <>
        <h1 className={styles.titleMain}>הרשמה למערכת</h1>
        <p className={styles.subtitleMain}>
          מלא.י את הפרטים הבאים כדי להתחיל
        </p>
      </>
    );
  }
  
  const subtitleText = signupMethod === 'email' 
    ? "הרשמו באמצעות המייל והסיסמה שלכם.ן"
    : "בחר.י את דרך ההרשמה המועדפת";

  return (
    <>
      <h1 className={styles.titleMain}>הרשמה למערכת</h1>
      <p className={styles.subtitleMain}>
        {subtitleText}
      </p>
    </>
  );
} 