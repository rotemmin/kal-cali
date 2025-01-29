import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Ensure correct Supabase client import
import styles from "@/styles/HeaderMenu.module.css";

interface HeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGender = async () => {
      const supabase = createClient();
      const { data: user, error } = await supabase.auth.getUser();

      if (error || !user?.user) return;

      const userId = user.user.id;
      const { data: userMetadata, error: metadataError } = await supabase
        .from("user_metadata")
        .select("sex")
        .eq("id", userId)
        .single();

      if (!metadataError && userMetadata) {
        setGender(userMetadata.sex);
      }
    };

    fetchUserGender();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleLogout = () => {
    router.push("/logout");
    onClose();
  };

  const handlePersonalDetails = () => {
    router.push("/personal_details");
    onClose();
  };

  // Adjust button text based on gender
  const contactText = gender === "male" ? "צור קשר" : "צרי קשר";
  const logoutText = gender === "male" ? "התנתק" : "התנתקי";

  return (
    <div ref={dropdownRef} className={styles.menuContainer}>
      <div className={styles.topBlock}></div>
      <div className={styles.menuContent}>
        <button
          className={styles.menuButton}
          onClick={() => handleNavigation("/homePage")}
        >
          {contactText}
        </button>
        <button className={styles.menuButton} onClick={handlePersonalDetails}>
          פרטים אישיים
        </button>
        <button className={styles.menuButton} onClick={handleLogout}>
          {logoutText}
        </button>
      </div>
    </div>
  );
};

export default HeaderMenu;
