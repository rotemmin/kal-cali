"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/Header.module.css";

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleMenuClick = () => {
    console.log("Menu button clicked!"); // Replace with the menu open logic
  };

  return (
    <header className={styles.header}>
      <button className={styles.menuButton} onClick={handleMenuClick}>
        <img src="/icons/manu.svg" alt="Menu Icon" className={styles.icon} />
      </button>
      <button className={styles.logoButton} onClick={handleLogoClick}>
        <img src="/icons/logo.svg" alt="Logo Icon" className={styles.icon} />
      </button>
    </header>
  );
}
