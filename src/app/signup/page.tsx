'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import styles from './page.module.css';
import Link from 'next/link';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [sex, setSex] = useState('');
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
      // יצירת המשתמש ב-Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      
      // הגדרת הנתונים ההתחלתיים של המשתמש ב-Firestore
      const initialTopicsAndMilestones = {
        pension: {
          status: 0,
          milestones: {
            מה_זה_בכלל_פנסיה: 0,
            מה_קורה_היום_בשוק: 0,
            שיחה_עם_נציג: 0,
            נקודות_לייעוץ: 0,
          },
        },
        national_insurance: {
          status: 0,
          milestones: {
            מה_זה_בכלל_ביטוח_לאומי: 0,
            איך_משלמים_ביטוח_לאומי: 0,
            מי_פטור_מביטוח_לאומי: 0,
            תשלומי_חוב_לביטוח_לאומי_וקנסות: 0,
          },
        },
        bank_account: {
          status: 0,
          milestones: {
            פתיחת_חשבון_בנק: 0,
            בחירת_כרטיס_אשראי: 0,
            ניהול_מסגרת_אשראי: 0,
            מידע_על_עמלות_ותשלומים: 0,
            שיחה_עם_נציג_בנק: 0,
          },
        },
      };

      // יצירת מסמך פעילות משתמש ב-Firestore
      await setDoc(doc(db, "user_activity", userId), {
        id: userId,
        activity_type: "initial_signup",
        topics_and_milestones: initialTopicsAndMilestones,
        curr_topic: 0,
        curr_milestone: 0,
        budget: 0,
      });
      
      // יצירת מסמך מידע משתמש ב-Firestore
      await setDoc(doc(db, "user_metadata", userId), {
        id: userId,
        first_name: firstName,
        second_name: familyName,
        sex: sex,
      });
      
      router.push('/homePage');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>מלאו את הפרטים הבאים כדי להתחיל</p>
        <form className={styles.signupForm} onSubmit={handleSubmit}>
          <div className={styles.nameInputsRow}>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="שם פרטי"
              required
              className={styles.inputContainer}
            />
            <input
              type="text"
              name="familyName"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="שם משפחה"
              required
              className={styles.inputContainer}
            />
          </div>
          <div className={styles.nameInputsRow}>
            <select 
              name="sex" 
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required 
              className={styles.inputContainer}
            >
              <option value="">בחר מין</option>
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
              <option value="other">אחר</option>
            </select>
          </div>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="כתובת מייל"
            required
            className={styles.inputContainer}
          />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="סיסמה"
            required
            className={styles.inputContainer}
          />
          <button type="submit">הרשמה</button>
        </form>

        {error && <p style={{ color: "red" }}>{error}</p>}
        
        <p className="mt-4 text-center">
          כבר יש לך חשבון?{' '}
          <Link href="/login">
            התחבר כאן
          </Link>
        </p>
      </div>
    </div>
  );
}