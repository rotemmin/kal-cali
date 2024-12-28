import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function SignUp({
  searchParams,
}: {
  searchParams?: { message?: string }; // Updated to handle optional `searchParams` safely
}) {
  const signUp = async (formData: FormData) => {
    "use server"; // Indicates server-only code
    const origin = headers().get("origin");
    if (!origin) {
      console.error("Origin header is missing");
      return redirect("/signup?message=Server error: Missing origin");
    }

    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    // Validate email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return redirect("/signup?message=Invalid email format");
    }

    if (!password || password.length < 6) {
      return redirect(
        "/signup?message=Password must be at least 6 characters long"
      );
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${origin}/auth/callback`, // Ensure proper string interpolation
        },
      });

      if (error) {
        console.error("Supabase Sign-Up Error:", error);
        return redirect("/signup?message=Could not authenticate user");
      }

      return redirect(
        "/signup?message=Check email to continue sign up process"
      );
    } catch (err) {
      console.error("Unexpected Error:", err);
      return redirect("/homePage?message=Server error occurred");
    }
  };

  return (
    <div className="content">
      <form className={styles.loginForm} action={signUp}>
        <label htmlFor="email">
          Email{" "}
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            required
          />
        </label>

        <label htmlFor="password">
          Password{" "}
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
        </label>

        <button type="submit">Sign Up</button>
        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </form>
    </div>
  );
}
