"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

interface UserData {
  name: string;
  email: string;
  gender: string;
  password: string;
}

const PersonalDetails = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

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
      <Header />
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>פרטים אישיים</h1>
          <button
            className={styles.editButton}
            onClick={() => router.push("/edit_personal_details")}
          >
            עריכה
          </button>
        </div>
        {user && (
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>שם</div>
              <div className={styles.value}>{user.name}</div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.subHeading}>כתובת מייל</div>
              <div className={styles.value}>{user.email}</div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.subHeading}>סיסמה</div>
              <div className={styles.value}>{user.password}</div>
            </div>

            <div className={styles.detailItem}>
              <div className={styles.subHeading}>לשון פנייה</div>
              <div className={styles.value}>{user.gender}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;
