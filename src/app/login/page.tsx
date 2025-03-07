'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import styles from './page.module.css';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError('פורמט אימייל לא תקין');
      return;
    }
    
    if (!password || password.length < 6) {
      setError('סיסמה חייבת להיות באורך 6 תווים לפחות');
      return;
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/homePage');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>הזינו את הפרטים הבאים כדי להתחיל</p>
        
        <form className={styles.loginForm} onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת מייל"
            required
            className={`${styles.inputContainer} ${error ? styles.error : ''}`}
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            required
            className={`${styles.inputContainer} ${error ? styles.error : ''}`}
          />
          <button type="submit">כניסה</button>
        </form>
        
        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <p className="mt-4 text-center">
          אין לך חשבון עדיין?{' '}
          <Link href="/signup">
            הירשם כאן
          </Link>
        </p>
      </div>
    </div>
  );
}