"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


const BurgerMenuPage: React.FC = () => {
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);
  
    const handleClose = () => {
      router.back(); 
    };


  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      handleClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={menuRef} style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '60%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.91)',
      zIndex: 1000
    }}>

      <button onClick={handleClose} style={{ float: 'left', margin: '10px' }}>
        סגור
      </button>

      <ul>
        <li>
          <Link href="/stickers_notebook">
            מחברת המדבקות
          </Link>
        </li>
        <li>
          <Link href="/personal_notebook">
            המחברת האישית
          </Link>
        </li>
      </ul>

    </div>
  );
};

export default BurgerMenuPage;