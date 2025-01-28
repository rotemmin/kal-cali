import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/HeaderMenu.module.css";

interface HeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
    router.push("app/personal_details");
    onClose();
  };

  return (
    <div ref={dropdownRef} className={styles.menuContainer}>
      <div className={styles.topBlock}></div>
      <div className={styles.menuContent}>
        <button
          className={styles.menuButton}
          onClick={() => handleNavigation("/homePage")}
        >
          צרי קשר
        </button>
        <button className={styles.menuButton} onClick={handlePersonalDetails}>
          פרטים אישיים
        </button>
        <button className={styles.menuButton} onClick={handleLogout}>
          התנתקי
        </button>
      </div>
    </div>
  );
};

export default HeaderMenu;
