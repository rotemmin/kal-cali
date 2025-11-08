import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

export default function VerificationMessage() {
  const { email } = useSignup();

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={styles.titleMain}>הרשמה למערכת</h1>
        <div className={styles.verificationContent}>
          <p className={styles.verificationText}>
            שלחנו הודעת אימות לכתובת <strong>{email}</strong>.
          </p>
          <p className={styles.verificationText}>
            אנא בדקו את תיבת הדואר הנכנס שלכם (וגם את תיקיית הספאם) ולחצו על הקישור לאימות כתובת המייל.
          </p>
          <p className={styles.verificationText}>
            לאחר האימות תוכלו להתחבר למערכת ולהתחיל להשתמש באפליקציה!
          </p>
        </div>
      </div>
    </div>
  );
} 