"use client";

import React, { useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BurgerMenuPage: React.FC = () => {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Define handleClose
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Define handleClickOutside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Add/remove event listener
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "60%",
        height: "100%",
        backgroundColor: "rgba(255, 255, 255, 0.91)",
        zIndex: 1000,
      }}
    >
      <ul>
        <li>
          <Link href="/personal_notebook">המחברת האישית</Link>
        </li>
      </ul>
    </div>
  );
};

export default BurgerMenuPage;
