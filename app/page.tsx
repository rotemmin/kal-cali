import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.welcome}>ברוכ.ה הבא.ה ל-</h1>
          
          <Image
            src="/icons/firstPageLogo.svg"
            alt="FinanStep Logo"
            width={349}
            height={261}
            priority
            className={styles.logo}
          />
          
          <p className={styles.description}>
            {/* מי שרוצה ללמוד על תהליך כלכלי נכון שירים את היד! (או ילחץ על הכפתור) */}
            איתנו אפשר להקליל פיננסיים
          </p>
          
          <div className={styles.buttonContainer}>
            <Link href="/login" className={styles.buttonLink}>
              <button className={styles.loginButton}>לכניסה</button>
            </Link>
            
            <Link href="/signup" className={styles.buttonLink}>
              <button className={styles.signupButton}>להרשמה</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}