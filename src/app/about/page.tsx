import Image from "next/image";
import Link from "next/link";
import Header from "@/components/general/Header";
import styles from "./page.module.css";

const AboutPage = () => {
  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <h1 className={styles.title}>אודות</h1>

        <section className={styles.textSection}>
          <p className={styles.paragraph}>
            <span className={styles.inlineLogo}>
              <Image
                src="/icons/logo.png"
                alt="לוגו קלקלי"
                width={45}
                height={27}
              />
            </span>
            היא אפליקציה שעוזרת לצעירים לנהל את הכסף שלהם – בלי בולשיט, בלי מסכים מפחידים, ובלי מונחים מסובכים.
          </p>
          <p className={styles.paragraph}>
            היא נוצרה מצורך אמיתי שלנו, עבור עמותת מתייעלים, במסגרת קורס משותף של האוניברסיטה העברית ואקדמיית בצלאל, מתוך מטרה לייצר שינוי אמיתי - כזה שמאפשר לצעירים לקחת אחריות על החיים הכלכליים שלהם, להבין את הזכויות שלהם, ולתכנן קדימה בלי פחד.
          </p>
          <p className={`${styles.paragraph} ${styles.secondaryParagraph}`}>
            <strong className={styles.emphasis}>הצוות שלנו:</strong>
            <br />
            עיצוב - שקד שהרבני, נגה אלוני, רתם אשורי.
            <br />
            פיתוח - רותם מינאי.
            <br />
            כתיבת תוכן - אפרת נגאוקר.
          </p>
          <p className={`${styles.paragraph} ${styles.secondaryParagraph}`}>
            <strong className={styles.emphasis}>פונטים באדיבות הגילדה</strong>
          </p>
        </section>

        <div className={styles.buttonContainer}>
          <Link href="/homePage" className={styles.primaryButton}>
            חזרה לדף הבית
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;

