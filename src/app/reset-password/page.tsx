"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import Header from "@/components/general/Header";
import styles from "./page.module.css";
import { auth } from "@/lib/firebase";
import { X } from "lucide-react";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setError("הקישור לאיפוס סיסמה אינו תקין");
        setIsVerifying(false);
        return;
      }

      try {
        await verifyPasswordResetCode(auth, oobCode);
        setError(null);
      } catch (verificationError) {
        console.error("שגיאה באימות קוד לאיפוס:", verificationError);
        setError("הקישור לאיפוס סיסמה אינו תקין או שפג תוקפו");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyCode();
  }, [oobCode]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!oobCode) {
      setError("הקישור לאיפוס סיסמה אינו תקין");
      return;
    }

    if (password.trim().length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, password);
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 2200);
    } catch (resetError: any) {
      console.error("שגיאה באיפוס סיסמה:", resetError);
      if (resetError?.code === "auth/invalid-action-code") {
        setError("הקישור לאיפוס סיסמה אינו תקין או שכבר שימש בעבר");
      } else {
        setError("אירעה שגיאה באיפוס הסיסמה. נסה שוב מאוחר יותר");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <X className={styles.closeButton} onClick={() => router.push("/login")} />
      <div className={styles.content}>
        <h1 className={styles.title}>הגדרת סיסמה חדשה</h1>

        {isVerifying && (
          <div className={styles.statusMessage}>טוען קישור...</div>
        )}

        {error && !isVerifying && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        {success && (
          <div className={styles.successMessage}>
            הסיסמה הוגדרה בהצלחה! אנו מפנים אותך למסך ההתחברות...
          </div>
        )}

        {!isVerifying && !success && !error && (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <label className={styles.label} htmlFor="password">
                סיסמה חדשה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={styles.input}
                placeholder="בחר סיסמה חדשה"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.inputWrapper}>
              <label className={styles.label} htmlFor="confirmPassword">
                אימות סיסמה
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={styles.input}
                placeholder="הקלד שוב את הסיסמה"
                disabled={isSubmitting}
                autoComplete="new-password"
              />
            </div>

            <div className={styles.buttonRow}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "שומרים..." : "שמירה"}
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

const ResetPasswordPage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <Header />
          <div className={styles.content}>
            <div className={styles.statusMessage}>טוען קישור...</div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;

