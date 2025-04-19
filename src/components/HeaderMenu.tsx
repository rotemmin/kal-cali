import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/HeaderMenu.module.css";
import MenuButton from "./MenuButton";
import { useUserGender } from "./UserGenderContext";

interface HeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { gender } = useUserGender();
  
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

  const contactText = gender === "male" ? "צור קשר" : "צרי קשר";
  const logoutText = gender === "male" ? "התנתק" : "התנתקי";

  return (
    <div ref={dropdownRef} className={styles.menuContainer}>
      <div className={styles.topBlock}></div>
      <div className={styles.menuContent}>
        <MenuButton onClick={() => handleNavigation("/contact")}>
          {contactText}
        </MenuButton>
        <MenuButton onClick={handlePersonalDetails}>
          פרטים אישיים
        </MenuButton>
        <MenuButton onClick={handleLogout}>
          {logoutText}
        </MenuButton>
      </div>
    </div>
  );
};

export default HeaderMenu;