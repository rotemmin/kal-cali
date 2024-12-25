import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function SignUp({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const signUp = async (formData: FormData) => {
    "use server";
    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return redirect("/signup?message=Invalid email format");
    }

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`, // Corrected syntax
      },
    });
    if (error) {
      console.error(error);
      return redirect("/signup?message=Could not authenticate user");
    }
    return redirect("/signup?message=Check email to continue sign up process");
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

        <button>Sign Up</button>
        {searchParams?.message && (
          <p className={styles.errorMessage}>{searchParams.message}</p>
        )}
      </form>
    </div>
  );
}
