"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/general/Header";
import styles from "./page.module.css";
import { X } from "lucide-react";

const ContactUs = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("אנא הזן הודעה");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Detailed error:", data.error);
        throw new Error("Failed to send message");
      }

      setMessage("");
      setIsSubmitted(true);
      
      setTimeout(() => {
        router.push("/homePage");
      }, 2000);
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("לא הצלחנו לשלוח את ההודעה כרגע, אנא נסה שוב מאוחר יותר");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <X className={styles.closeButtonContact} onClick={() => router.back()} />
      <div className={styles.content}>
        <h1 className={styles.title}>צור קשר</h1>

        {isSubmitted ? (
          <div className={styles.successMessage}>
            תודה על פנייתך! נחזור אליך בהקדם.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              placeholder="כתוב כאן את ההודעה שלך..."
            ></textarea>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.buttonContainer}>
              <button 
                type="submit" 
                className={styles.sendButton}
                disabled={isLoading}
              >
                {isLoading ? "שולח..." : "שליחה"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactUs;
