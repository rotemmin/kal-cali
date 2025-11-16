"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/Header.module.css";
import HeaderMenu from "./HeaderMenu";
import Image from "next/image";

interface HeaderProps {
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

export default function Header({ menuButtonRef: externalMenuButtonRef }: HeaderProps = {}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const internalMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (externalMenuButtonRef && internalMenuButtonRef.current) {
      externalMenuButtonRef.current = internalMenuButtonRef.current;
    }
  }, [externalMenuButtonRef]);

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
          ref={(node) => {
            internalMenuButtonRef.current = node;
            if (externalMenuButtonRef) {
              externalMenuButtonRef.current = node;
            }
          }}
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
          anchorRef={internalMenuButtonRef}
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