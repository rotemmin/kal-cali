"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { sendPasswordResetEmail } from "firebase/auth";
import Header from "@/components/general/Header";
import styles from "./page.module.css";
import { auth } from "@/lib/firebase";
import { X } from "lucide-react";

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("אנא הזן כתובת מייל");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(
        "שלחנו מייל לאיפוס הסיסמה. בדקו את תיבת הדואר הנכנס (וגם את הספאם)."
      );
      setEmail("");
    } catch (err: any) {
      if (err?.code === "auth/user-not-found") {
        setError("לא נמצא משתמש עם כתובת המייל הזו");
      } else if (err?.code === "auth/invalid-email") {
        setError("כתובת המייל אינה תקינה");
      } else {
        setError("אירעה שגיאה בשליחת המייל. נסה שוב מאוחר יותר");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <X className={styles.closeButton} onClick={() => router.back()} />
      <div className={styles.content}>
        <h1 className={styles.title}>איפוס סיסמה</h1>
        <p className={styles.description}>
          הזינו את כתובת המייל ונשלח קישור ליצירת סיסמה חדשה.
        </p>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {successMessage && (
          <div className={styles.successMessage}>{successMessage}</div>
        )}

        {!successMessage && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={styles.input}
                placeholder="המייל שלך"
                disabled={isSubmitting}
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "שולחים..." : "איפוס"}
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/login")}
                disabled={isSubmitting}
              >
                ביטול
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

