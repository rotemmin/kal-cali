import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Login({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return redirect("/login?message=Invalid email format");
    }
    if (!password || password.length < 6) {
      return redirect(
        "/login?message=Password must be at least 6 characters long"
      );
    }

    const supabase = createClient(cookies());

    try {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        return redirect(
          `/login?message=${encodeURIComponent(signInError.message)}`
        );
      }

      if (!signInData?.user) {
        return redirect(
          "/login?message=Login succeeded but no user object returned"
        );
      }

      return redirect("/homePage");
    } catch (err) {
      return redirect("/homePage");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>הזינו את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.loginForm} action={signIn}>
          <input
            type="email"
            name="email"
            placeholder="כתובת מייל"
            required
            className={`${styles.inputContainer} ${
              searchParams?.message ? styles.error : ""
            }`}
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            required
            className={`${styles.inputContainer} ${
              searchParams?.message ? styles.error : ""
            }`}
          />
          <button type="submit">כניסה</button>
        </form>
        {searchParams?.message && (
          <p style={{ color: "red" }}>{searchParams.message}</p>
        )}
      </div>
    </div>
  );
}
