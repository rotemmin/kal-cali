import { supabase } from "@/lib/supabase/client";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function Login({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return redirect("/login?message=Invalid email format");
    }

    // Validate password length
    if (password.length < 6) {
      return redirect(
        "/login?message=Password must be at least 6 characters long"
      );
    }

    try {
      // Use Supabase's `auth.signInWithPassword` to log in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return redirect("/login?message=Could not authenticate user");
      }

      // Redirect to homepage on successful login
      return redirect("/homePage");
    } catch (error) {
      return redirect("/homePage");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>הזיני את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.loginForm} action={signIn}>
          <input
            name="email"
            type="email"
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
          <button type="submit" className={styles.loginButton}>
            כניסה
          </button>
        </form>
        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </div>
    </div>
  );
}
