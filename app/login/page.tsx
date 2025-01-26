import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return redirect("/login?message=Invalid email format");
    }

    if (password.length < 6) {
      return redirect(
        "/login?message=Password must be at least 6 characters long"
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log("error", error);
      return redirect("/login?message=Could not authenticate user");
    }
    return redirect("/homePage");
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>הזיני את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.loginForm} action={signIn}>
          <input
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

          <button className={styles.loginButton}>כניסה</button>
        </form>
      </div>
    </div>
  );
}
