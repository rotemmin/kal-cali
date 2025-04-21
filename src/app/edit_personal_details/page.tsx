"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import styles from "./page.module.css";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  gender: string;
}

interface EditState {
  firstName: boolean;
  lastName: boolean;
  email: boolean;
  password: boolean;
  gender: boolean;
}

const EditPersonalDetails = () => {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
  });

  // Track which fields have been edited
  const [edited, setEdited] = useState<EditState>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    gender: false,
  });

  useEffect(() => {
    const fetchUserDetails = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: metadata, error: metadataError } = await supabase
          .from("user_metadata")
          .select("first_name, second_name, gender")
          .eq("id", session.user.id)
          .single();

        if (!metadataError && metadata) {
          setFormData({
            firstName: metadata.first_name || "",
            lastName: metadata.second_name || "",
            email: session.user.email || "",
            password: "********",
            gender: metadata.gender || "",
          });
        }
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setEdited((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error("No user session found");
        return;
      }

      // Update user metadata first
      const { error: metadataError } = await supabase
        .from("user_metadata")
        .update({
          first_name: formData.firstName,
          second_name: formData.lastName,
          gender: formData.gender,
        })
        .eq("id", session.user.id);

      if (metadataError) {
        console.error("Error updating metadata:", metadataError);
        return;
      }

      // Only update email if it's changed
      if (edited.email && formData.email !== session.user.email) {
        const { data, error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });

        if (emailError) {
          console.error("Error updating email:", emailError);
          return;
        }

        // Wait for the email update to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Only update password if it's changed and not the placeholder
      if (edited.password && formData.password !== "********") {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.password,
        });
        if (passwordError) {
          console.error("Error updating password:", passwordError);
          return;
        }
      }

      // Navigate back only after all updates are successful
      router.push("/homePage");
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.title}>פרטים אישיים</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.nameContainer}>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={`${styles.inputHalf} ${
                edited.firstName ? styles.edited : styles.default
              }`}
              placeholder={formData.firstName || "שם פרטי"}
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={`${styles.inputHalf} ${
                edited.lastName ? styles.edited : styles.default
              }`}
              placeholder={formData.lastName || "שם משפחה"}
            />
          </div>

          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={`${styles.input} ${
              edited.email ? styles.edited : styles.default
            }`}
            placeholder={formData.email}
          />

          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className={`${styles.input} ${
              edited.password ? styles.edited : styles.default
            }`}
            placeholder="סיסמה"
          />

          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className={`${styles.input} ${
              edited.gender ? styles.edited : styles.default
            }`}
          >
            <option value="">בחר מין</option>
            <option value="male">זכר</option>
            <option value="female">נקבה</option>
            <option value="other">אחר</option>
          </select>

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              שמירה
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPersonalDetails;
