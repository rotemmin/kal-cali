import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

export default function VerificationMessage() {
  const { email } = useSignup();

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </div>
      <h3 className={styles.verificationTitle}>אימות המייל נשלח!</h3>
      <p className={styles.verificationText}>
        שלחנו הודעת אימות לכתובת: <strong>{email}</strong>
      </p>
      <p className={styles.verificationInstructions}>
        אנא בדקו את תיבת הדואר הנכנס שלכם (וגם את תיקיית הספאם) ולחצו על הקישור לאימות כתובת המייל.
      </p>
      <p className={styles.verificationNote}>
        לאחר האימות, תוכלו להתחבר למערכת ולהתחיל להשתמש באפליקציה.
      </p>
    </div>
  );
} 