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
        "/signup?message=Password must be at least 6 characters long"
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
    return redirect("/");
  };

  return (
    <div className="content">
      <form className={styles.loginForm} action={signIn}>
        <label htmlFor="email">
          Email <input name="email" placeholder="you@example.com" required />
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

        <button>Log In</button>
        {/* <button formAction={signUp}>Sign Up</button> */}
        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </form>
    </div>
  );
}
