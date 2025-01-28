import React, { useEffect, useRef } from "react";
import styles from "@/styles/HeaderMenu.module.css";

interface HeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={dropdownRef} className={styles.menuContainer}>
      <div className={styles.topBlock}></div>
      <div className={styles.menuContent}>
        <button className={styles.menuButton}>צרי קשר</button>
        <button className={styles.menuButton}>פרטים אישיים</button>
        <button className={styles.menuButton}>התנתקי</button>
      </div>
    </div>
  );
};

export default HeaderMenu;
