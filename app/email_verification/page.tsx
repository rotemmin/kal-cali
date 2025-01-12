"use client"; // Ensure this is a client-side component

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function EmailVerification() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleConfirmed = async () => {
    setMessage("Checking verification status...");

    // Get the latest session
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      setMessage("Error refreshing session. Please try again.");
      return;
    }

    // Get the latest user session
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Check if the email is confirmed
    if (!userData.user.email_confirmed_at) {
      setMessage("Email not verified. Please check your inbox and try again.");
      return;
    }

    // If verified, redirect to the homepage
    router.push("/homePage");
  };

  return (
    <div className={styles.container}>
      <h1>Email Verification Required</h1>
      <p>
        We've sent a verification link to your email. Please check your inbox
        and confirm your email address to proceed.
      </p>
      <button onClick={handleConfirmed} className={styles.confirmButton}>
        I've Confirmed
      </button>
      {message && <p className={styles.errorMessage}>{message}</p>}
    </div>
  );
}
