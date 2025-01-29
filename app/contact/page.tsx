"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import styles from "./page.module.css";

const ContactUs = () => {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error("No user session found");
        return;
      }

      // Insert the message into a contact messages table
      const { error } = await supabase.from("contact_messages").insert([
        {
          user_id: session.user.id,
          message,
        },
      ]);

      if (error) {
        console.error("Error submitting message:", error);
        return;
      }

      setMessage("");

      // Navigate to homePage after successful submission
      router.push("/homePage");
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.title}>צור קשר</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.textarea}
            placeholder="כתוב כאן את ההודעה שלך..."
          ></textarea>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.sendButton}>
              שליחה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
