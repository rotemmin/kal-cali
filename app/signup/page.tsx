import { createClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

export default function SignUp({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    if (!origin) {
      console.error("Origin header is missing");
      return redirect("/signup?message=Server error: Missing origin");
    }

    const email = formData.get("email") as string | null;
    const password = formData.get("password") as string | null;
    const firstName = formData.get("firstName") as string | null;
    const familyName = formData.get("familyName") as string | null;
    const sex = formData.get("sex") as string | null;

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
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });

      if (signUpError) {
        return redirect(
          `/signup?message=${encodeURIComponent(signUpError.message)}`
        );
      }

      if (!signUpData?.user) {
        return redirect(
          "/signup?message=Sign-up succeeded but no user object returned"
        );
      }

      const userId = signUpData.user.id;

      // Insert initial data into user_activity table
      const initialTopicsAndMilestones = {
        pension: {
          status: 0,
          milestones: {
            מה_זה_בכלל_פנסיה: 0,
            מה_קורה_היום_בשוק: 0,
            שיחה_עם_נציג: 0,
            נקודות_לייעוץ: 0,
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

      // Insert user metadata into user_metadata table
      const { error: metadataError } = await supabase
        .from("user_metadata")
        .insert([
          {
            id: userId,
            first_name: firstName,
            second_name: familyName,
            sex: sex,
          },
        ]);

      if (metadataError) {
        return redirect(
          `/signup?message=${encodeURIComponent(metadataError.message)}`
        );
      }

      if (!signUpData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          return redirect(
            `/signup?message=${encodeURIComponent(signInError.message)}`
          );
        }
      }

      return redirect("/homePage");
    } catch (err) {
      return redirect("/homePage");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>מלאו את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.signupForm} action={signUp}>
          <div className={styles.nameInputsRow}>
            <input
              type="text"
              name="firstName"
              placeholder="שם פרטי"
              required
              className={styles.inputContainer}
            />
            <input
              type="text"
              name="familyName"
              placeholder="שם משפחה"
              required
              className={styles.inputContainer}
            />
          </div>
          <div className={styles.nameInputsRow}>
            <select name="sex" required className={styles.inputContainer}>
              <option value="">בחר מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
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
