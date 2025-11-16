"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./OnboardingOverlay.module.css";

interface OnboardingOverlayProps {
  onComplete: () => void;
  menuButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
}

const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete, menuButtonRef }) => {
  const [step, setStep] = useState<"menu" | "guide">("menu");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuButtonPosition, setMenuButtonPosition] = useState<DOMRect | null>(null);
  const [guideButtonPosition, setGuideButtonPosition] = useState<DOMRect | null>(null);

  useEffect(() => {
    const updateMenuButtonPosition = () => {
      const menuIcon = document.querySelector('button[class*="menuButton"] img') as HTMLImageElement;
      if (menuIcon) {
        const rect = menuIcon.getBoundingClientRect();
        setMenuButtonPosition(rect);
      } else if (menuButtonRef?.current) {
        const rect = menuButtonRef.current.getBoundingClientRect();
        setMenuButtonPosition(rect);
      } else {
        const menuButton = document.querySelector('button[class*="menuButton"]') as HTMLButtonElement;
        if (menuButton) {
          const rect = menuButton.getBoundingClientRect();
          setMenuButtonPosition(rect);
        }
      }
    };

    updateMenuButtonPosition();
    window.addEventListener("resize", updateMenuButtonPosition);
    window.addEventListener("scroll", updateMenuButtonPosition);

    const checkMenuState = () => {
      const menuContainer = document.querySelector('[class*="menuContainer"]');
      const isOpen = menuContainer && window.getComputedStyle(menuContainer).display !== "none";
      setIsMenuOpen(!!isOpen);
      
      if (isOpen && step === "menu") {
        setTimeout(() => {
          setStep("guide");
          const menuButtons = Array.from(document.querySelectorAll('[class*="menuButton"]'));
          const guideButton = menuButtons.find(btn => 
            btn.textContent?.includes("המדריך") || btn.textContent?.includes("מדריך")
          ) as HTMLElement;
          
          if (guideButton) {
            const rect = guideButton.getBoundingClientRect();
            setGuideButtonPosition(rect);
          }
        }, 300);
      }
    };

    const observer = new MutationObserver(() => {
      checkMenuState();
      updateMenuButtonPosition();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    const interval = setInterval(() => {
      checkMenuState();
      updateMenuButtonPosition();
    }, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      window.removeEventListener("resize", updateMenuButtonPosition);
      window.removeEventListener("scroll", updateMenuButtonPosition);
    };
  }, [step, menuButtonRef]);

  const handleSkip = () => {
    onComplete();
  };

  if (step === "menu" && menuButtonPosition) {
    const tooltipWidth = 280;
    const iconCenterX = menuButtonPosition.left + (menuButtonPosition.width / 2);
    const screenWidth = window.innerWidth;
    const padding = 20;
    
    let adjustedLeft = iconCenterX;
    if (iconCenterX - (tooltipWidth / 2) < padding) {
      adjustedLeft = padding + (tooltipWidth / 2);
    } else if (iconCenterX + (tooltipWidth / 2) > screenWidth - padding) {
      adjustedLeft = screenWidth - padding - (tooltipWidth / 2);
    }

    const tooltipHalfWidth = tooltipWidth / 2;
    const maxArrowOffset = tooltipHalfWidth - 15;
    const arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, iconCenterX - adjustedLeft));

    return (
      <div className={styles.overlay}>
        <div 
          className={styles.highlight} 
          style={{ 
            top: menuButtonPosition.top -4,
            left: menuButtonPosition.left -10,
            width: menuButtonPosition.width + 20,
            height: menuButtonPosition.height+8,
          }} 
        />
        <div 
          className={styles.tooltip} 
          style={{
            top: menuButtonPosition.bottom + 20,
            left: adjustedLeft,
          }}
        >
          <p className={styles.tooltipText}>לחצו כאן להסבר!</p>
          <div 
            className={styles.arrow} 
            style={{
              transform: `translateX(calc(-50% + ${arrowOffset}px))`,
            }}
          />
          {/* <button className={styles.skipButton} onClick={handleSkip}>
            דלג
          </button> */}
        </div>
      </div>
    );
  }

  if (step === "guide" && isMenuOpen && guideButtonPosition) {
    const tooltipWidth = 280;
    const buttonCenterX = guideButtonPosition.left + (guideButtonPosition.width / 2);
    const screenWidth = window.innerWidth;
    const padding = 20;
    
    let adjustedLeft = buttonCenterX;
    if (buttonCenterX - (tooltipWidth / 2) < padding) {
      adjustedLeft = padding + (tooltipWidth / 2);
    } else if (buttonCenterX + (tooltipWidth / 2) > screenWidth - padding) {
      adjustedLeft = screenWidth - padding - (tooltipWidth / 2);
    }

    const tooltipHalfWidth = tooltipWidth / 2;
    const maxArrowOffset = tooltipHalfWidth - 15;
    const arrowOffset = Math.max(-maxArrowOffset, Math.min(maxArrowOffset, buttonCenterX - adjustedLeft));

    return (
      <div className={styles.overlay}>
        <div 
          className={styles.highlight} 
          style={{ 
            top: guideButtonPosition.top -6,
            left: guideButtonPosition.left - 2,
            width: guideButtonPosition.width + 4,
            height: guideButtonPosition.height +4,
          }} 
        />
        {/* <div 
          className={styles.tooltip} 
          style={{
            top: guideButtonPosition.bottom + 20,
            left: adjustedLeft,
          }}
        >
          <p className={styles.tooltipText}>לחץ כאן כדי לראות את המדריך</p>
          <div 
            className={styles.arrow} 
            style={{
              transform: `translateX(calc(-50% + ${arrowOffset}px))`,
            }}
          />
          <button className={styles.skipButton} onClick={handleSkip}>
            דלג
          </button>
        </div> */}
      </div>
    );
  }

  return null;
};

export default OnboardingOverlay;

