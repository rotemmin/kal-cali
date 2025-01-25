"use client";

import { useRouter } from "next/navigation";
import styles from "@/styles/Header.module.css";

export default function Header() {
  const router = useRouter();

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleMenuClick = () => {
    router.push("/burger_menu");
  };

  return (
    <header className={styles.header}>
      <button className={styles.menuButton} onClick={handleMenuClick}>
        <img
          src="/icons/menu.svg"
          alt="Menu Icon"
          className={styles.menuIcon}
        />
      </button>
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
