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

    const supabase = createClient(cookies());

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback` },
      });

      if (error) {
        console.error("Sign-Up Error:", error.message);
        return redirect(`/signup?message=${encodeURIComponent(error.message)}`);
      }

      if (data?.user) {
        const userId = data.user.id;
        console.log("User ID:", userId);

        // Initialize topics and milestones JSON
        const initialTopicsAndMilestones = {
          pension: {
            status: 0,
            milestones: {
              general_info: 0,
              how_yoezt: 0,
              the_market: 0,
              speak_yoezt: 0,
              open_foundation: 0,
              first_deposit: 0,
            },
          },
          national_insurence: {
            status: 0,
            milestones: {
              general_info: 0,
              how_to_pay: 0,
              payment_exemption: 0,
              payment_methods: 0,
            },
          },
          banks_and_credis_cards: {
            status: 0,
            milestones: {
              opening_account: 0,
              choose_card: 0,
              important_info: 0,
              credit_manegment: 0,
              amalot: 0,
              finance_safty: 0,
              bank_yoezt: 0,
            },
          },
        };

        // Insert initial user activity
        const { error: activityError } = await supabase
          .from("user_activity")
          .insert([
            {
              id: userId,
              activity_type: "initial_signup",
              topics_and_milestones: initialTopicsAndMilestones,
              curr_topic: 0,
              curr_milestone: 0,
            },
          ]);
        if (activityError) {
          console.error(
            "Activity Initialization Error:",
            activityError.message
          );
          return redirect(
            `/signup?message=${encodeURIComponent(activityError.message)}`
          );
        }
        // Redirect to home page after successful signup
        return redirect("/homePage");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      return redirect("/homePage");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>מלאי את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.signupForm} action={signUp}>
          <div className={styles.nameInputsRow}>
            <input
              type="text"
              name="familyName"
              placeholder="שם משפחה"
              required
              className={`${styles.inputContainer} ${
                searchParams?.message ? styles.error : ""
              }`}
            />
            <input
              type="text"
              name="firstName"
              placeholder="שם פרטי"
              required
              className={`${styles.inputContainer} ${
                searchParams?.message ? styles.error : ""
              }`}
            />
          </div>
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
          <button type="submit">הרשמה</button>
        </form>
      </div>
    </div>
  );
}
