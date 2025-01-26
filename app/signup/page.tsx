import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function SignUp({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  // This is your server action that the <form> calls
  const signUp = async (formData: FormData) => {
    "use server"; // Required for server actions

    // 1) Basic environment checks
    const origin = headers().get("origin");
    if (!origin) {
      console.error("Origin header is missing");
      return redirect("/signup?message=Server error: Missing origin");
    }

    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;

    // 2) Validate
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return redirect("/signup?message=Invalid email format");
    }
    if (!password || password.length < 6) {
      return redirect(
        "/signup?message=Password must be at least 6 characters long"
      );
    }

    // 3) Create a Supabase server client
    const supabase = createClient(cookies());

    try {
      // 4) Attempt sign-up
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            // If you are using magic links or email confirmations
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });

      // If supabase.auth.signUp fails
      if (signUpError) {
        return redirect(
          `/signup?message=${encodeURIComponent(signUpError.message)}`
        );
      }

      // If signUp returns no user object
      if (!signUpData?.user) {
        return redirect(
          "/signup?message=Sign-up succeeded but no user object returned"
        );
      }

      const userId = signUpData.user.id;

      // 5) Insert row in user_activity
      const initialTopicsAndMilestones = {
        pension: {
          status: 0,
          milestones: {
            הסבר_כללי: 0,
            על_מה_מדברים_עם_יועץ: 0,
            מה_קורה_היום_בשוק: 0,
            שיחה_עם_יועץ: 0,
          },
        },
        national_insurance: {
          status: 0,
          milestones: {
            הסבר_כללי: 0,
            איך_משלמים_ביטוח_לאומי: 0,
            מי_פטור_מביטוח_לאומי: 0,
            תשלומי_חוב_לביטוח_לאומי_וקנסות: 0,
          },
        },
        bank_account: {
          status: 0,
          milestones: {
            פתיחת_חשבון_בנק: 0,
            בחירת_כרטיס_אשראי: 0,
            מושגים_חשובים: 0,
            ניהול_מסגרת_אשראי: 0,
            מידע_על_עמלות_ותשלומים: 0,
            שמירה_על_בטיחות_פיננסית: 0,
            שיחה_עם_נציג_בנק: 0,
          },
        },
      };

      const { error: activityError } = await supabase
        .from("user_activity")
        .insert([
          {
            // If your table's PK column is "id", store it here:
            id: userId,
            activity_type: "initial_signup",
            topics_and_milestones: initialTopicsAndMilestones,
            curr_topic: 0,
            curr_milestone: 0,
            budget: 0,
          },
        ]);

      if (activityError) {
        return redirect(
          `/signup?message=${encodeURIComponent(activityError.message)}`
        );
      }

      // 6) If signUpData.session is null, explicitly log them in
      //    This only works if your Auth settings allow unconfirmed sign-in.
      if (!signUpData.session) {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          // Typically "Email not confirmed" if you require confirmation
          return redirect(
            `/signup?message=${encodeURIComponent(signInError.message)}`
          );
        }
        // If signIn succeeds, the session cookie is now set in the browser's response
      }

      // 7) All done, user is signed in with a real session
      return redirect("/homePage");
    } catch (err) {
      // console.error("Unexpected signup error:", err);
      // return redirect("/signup?message=Unexpected signup error");
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
              className={styles.inputContainer}
            />
            <input
              type="text"
              name="firstName"
              placeholder="שם פרטי"
              required
              className={styles.inputContainer}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="כתובת מייל"
            required
            className={styles.inputContainer}
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            required
            className={styles.inputContainer}
          />
          <button type="submit">הרשמה</button>
        </form>

        {searchParams?.message && (
          <p style={{ color: "red" }}>{searchParams.message}</p>
        )}
      </div>
    </div>
  );
}
