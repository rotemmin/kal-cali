"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Header.module.css";
import HeaderMenu from "./HeaderMenu";

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogoClick = () => {
    router.push("/homePage");
  };

  const handleMenuClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.header}>
      <div style={{ position: "relative" }}>
        <button className={styles.menuButton} onClick={handleMenuClick}>
          <img
            src="/icons/menu.svg"
            alt="Menu Icon"
            className={styles.menuIcon}
          />
        </button>
        <HeaderMenu
          isOpen={isDropdownOpen}
          onClose={() => setIsDropdownOpen(false)}
        />
      </div>
      <button className={styles.logoButton} onClick={handleLogoClick}>
        <img
          src="/icons/logo.svg"
          alt="Logo Icon"
          className={styles.logoIcon}
        />
      </button>
    </header>
  );
}
