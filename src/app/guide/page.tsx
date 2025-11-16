"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/general/Header";
import { useUserGender } from "@/components/general/UserGenderContext";
import styles from "./page.module.css";

const GuidePage = () => {
  const { gender } = useUserGender();
  const guideText = "המדריך לקלכלי";

  useEffect(() => {
    localStorage.setItem("hasSeenGuide", "true");
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <h1 className={styles.title}>{guideText}</h1>

        <section className={styles.textSection}>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>איך להתחיל?</h2>
            <p className={styles.paragraph}>
              {gender === "male"
                ? "בכל פעם, בחר נושא שאתה מרגיש צורך להתעמק בו. למשל:"
                : "בכל פעם, בחרי נושא שאת מרגישה צורך להתעמק בו. למשל:"}
            </p>
            <div className={styles.exampleContainer}>
              <Image
                src="/stickers/finalStickersTitle/title_pension.svg"
                alt="דוגמה - פנסיה"
                width={120}
                height={120}
                className={styles.exampleSticker}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>אבני הדרך</h2>
            <p className={styles.paragraph}>
              {gender === "male"
                ? "כשאתה נכנס לנושא, נראה שחלק מאבני הדרך פתוחות לך לקריאה וחלק טרם, קרא את אבני הדרך לפי הסדר. כל אבן דרך תלמד אותך משהו חדש:"
                : "כשאת נכנסת לנושא, נראה שחלק מאבני הדרך פתוחות לך לקריאה וחלק טרם, קראי את אבני הדרך לפי הסדר. כל אבן דרך תלמד אותך משהו חדש:"}
            </p>
            <div className={styles.milestoneExample}>
              <div className={styles.milestoneButton}>אבן דרך</div>

            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>המטרות שלך</h2>
            <p className={styles.paragraph}>
              {gender === "male"
                ? "המטרה היא למידה, כתיבה במחברת, ואיסוף מדבקות לאורך הדרך. המדבקות נצברות גם במחברת שלך."
                : "המטרה היא למידה, כתיבה במחברת, ואיסוף מדבקות לאורך הדרך. המדבקות נצברות גם במחברת שלך."}
            </p>
            <div className={styles.featuresContainer}>
              <div className={styles.feature}>
                <Image
                  src="/icons/notebook.svg"
                  alt="מחברת"
                  width={60}
                  height={60}
                  className={styles.featureIcon}
                />
                <p className={styles.featureText}>
                  {gender === "male"
                    ? "המחברת האישית - רשום הערות ופרטים חשובים"
                    : "המחברת האישית - רשמי הערות ופרטים חשובים"}
                </p>
              </div>
              <div className={styles.feature}>
                <div className={styles.stickerExample}>
                  <Image
                    src="/stickers/littleStickersDrawing/pre_drawing_pension.svg"
                    alt="מדבקה"
                    width={60}
                    height={60}
                    className={styles.featureIcon}
                  />
                </div>
                <p className={styles.featureText}>
                  {gender === "male"
                    ? "איסוף מדבקות - חשוף וצבור מדבקות כשאתה משלים אבני דרך"
                    : "איסוף מדבקות - חשפי וצברי מדבקות כשאת משלימה אבני דרך"}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>המילון</h2>
            <p className={styles.paragraph}>
              {gender === "male"
                ? "כפתור המילון תמיד זמין לשירותך. לחץ עליו כדי להבין מונחים לא מוכרים שמופיעים בתוכן."
                : "כפתור המילון תמיד זמין לשירותך. לחצי עליו כדי להבין מונחים לא מוכרים שמופיעים בתוכן."}
            </p>
            <div className={styles.dictionaryExample}>
              <Image
                src="/icons/dictionary.svg"
                alt="מילון"
                width={60}
                height={60}
                className={styles.featureIcon}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>{gender === "male" ? "זכור" : "זכרי"}</h2>
            <p className={styles.paragraph}>
              {gender === "male"
                ? "המדריך הזה מחכה לך תמיד באותו המקום, בתפריט הראשי. תוכל לחזור אליו בכל עת."
                : "המדריך הזה מחכה לך תמיד באותו המקום, בתפריט הראשי. תוכלי לחזור אליו בכל עת."}
            </p>
          </div>
        </section>

        <div className={styles.buttonContainer}>
          <Link href="/homePage" className={styles.primaryButton}>
            {gender === "male" ? "חזרה לדף הבית" : "חזרה לדף הבית"}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default GuidePage;

