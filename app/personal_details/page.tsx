"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

interface UserData {
  name: string;
  email: string;
  gender: string;
  password: string;
}

const PersonalDetails = () => {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session && session.user) {
        const { data, error } = await supabase
          .from("user_metadata")
          .select("first_name, second_name, sex")
          .eq("id", session.user.id)
          .single();
        if (!error && data) {
          setUser({
            name: `${data.first_name ?? "לא ידוע"} ${
              data.second_name ?? ""
            }`.trim(),
            email: session.user.email ?? "לא ידוע",
            gender: data.sex ?? "לא ידוע",
            password: "********",
          });
        }
      }
    };
    fetchUserDetails();
  }, []);

  return (
    <div className={styles.container}>
      <button className={styles.editButton}>עריכה</button>
      <h1 className={styles.title}>
        <strong>פרטים אישיים</strong>
      </h1>
      {user ? (
        <div className={styles.details}>
          <p>
            <strong>שם</strong>
            <br />
            <span className={styles.label}>{user.name}</span>
          </p>
          <p>
            <strong>כתובת מייל</strong>
            <br />
            <span className={styles.label}>{user.email}</span>
          </p>
          <p>
            <strong>סיסמה</strong>
            <br />
            <span className={styles.label}>{user.password}</span>
          </p>
          <p>
            <strong>לשון פנייה</strong>
            <br />
            <span className={styles.label}>{user.gender}</span>
          </p>
        </div>
      ) : (
        <p>טוען...</p>
      )}
    </div>
  );
};

export default PersonalDetails;
