"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Header.module.css";
import HeaderMenu from "./HeaderMenu";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleLogoClick = () => {
    router.push("/homePage");
  };

  const handleMenuClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className={styles.header}>
      <div style={{ position: "relative" }}>
        <button
          ref={menuButtonRef}
          className={styles.menuButton}
          onClick={handleMenuClick}
        >
          <img
            src="/icons/menu.svg"
            alt="Menu Icon"
            className={styles.menuIcon}
          />
        </button>
        <HeaderMenu
          isOpen={isDropdownOpen}
          anchorRef={menuButtonRef}
          onClose={() => setIsDropdownOpen(false)}
        />
      </div>
      <button className={styles.logoButton} onClick={handleLogoClick}>
        <Image
          src="/icons/logo.png"
          alt="Logo Icon"
          className={styles.logoIcon}
          width={59}
          height={37}
        />
      </button>
    </header>
  );
}