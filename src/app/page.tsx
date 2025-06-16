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
            src="/icons/logo.png"
            alt="FinanStep Logo"
            width={281}
            height={185}
            priority
            className={styles.logo}
          />

          <p className={styles.description}>
            {/* אם את.ה רוצה ללמוד על תהליך כלכלי נכון תרים.י את היד! (או לחצ.י על הכפתור) */}
            רוצים ללמוד על תהליך כלכלי נכון? הרימו יד! (או לחצו על הכפתור)
          </p>

          <div className={styles.buttonContainer}>
            <Link href="/login" className={styles.buttonLink}>
              <button className={styles.loginButton}>כניסה</button>
            </Link>

            <Link href="/signup" className={styles.buttonLink}>
              <button className={styles.signupButton}>הרשמה</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
