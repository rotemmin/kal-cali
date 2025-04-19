'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle } from '@/lib/firebase';
import styles from './page.module.css';
import Link from 'next/link';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [sex, setSex] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const router = useRouter();

  // בדיקה אם המשתמש כבר מחובר
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsGoogleConnected(true);
        
        // מילוי אוטומטי של השם אם קיים בפרופיל גוגל
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          if (nameParts.length > 0) {
            setFirstName(nameParts[0]);
          }
          if (nameParts.length > 1) {
            setFamilyName(nameParts.slice(1).join(' '));
          }
        }
      } else {
        setIsGoogleConnected(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
      // לא צריך לעשות כלום נוסף כי ה-useEffect יטפל בעדכון המצב
    } catch (error: any) {
      console.error('Google sign up error:', error);
      setError('שגיאה בהתחברות עם גוגל: ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // וידוא שכל השדות מלאים
    if (!firstName.trim() || !familyName.trim() || !sex) {
      setError('יש למלא את כל השדות');
      setLoading(false);
      return;
    }
    
    try {
      // וידוא שהמשתמש מחובר
      const user = auth.currentUser;
      if (!user) {
        throw new Error('משתמש לא מחובר. אנא התחבר שוב עם Google');
      }
      
      const userId = user.uid;
      
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
        first_name: firstName.trim(),
        second_name: familyName.trim(),
        sex: sex,
        email: user.email,
        created_at: new Date(),
      });
      
      router.push('/homePage');
    } catch (error: any) {
      console.error('Error during signup:', error);
      setError(error.message || 'אירעה שגיאה בתהליך ההרשמה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>מלאו את הפרטים הבאים כדי להתחיל</p>
        
        {!isGoogleConnected ? (
          // שלב 1: התחברות עם גוגל
          <div className={styles.googleButtonContainer}>
            <button 
              className={styles.googleButton}
              onClick={handleGoogleSignUp}
              disabled={loading}
            >
              <div className={styles.googleIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </div>
              <span>{loading ? 'מתחבר...' : 'התחברות עם Google'}</span>
            </button>
            
            <p className={styles.googleInstruction}>
              התחבר עם Google כדי להמשיך
            </p>
          </div>
        ) : (
          // שלב 2: מילוי פרטים אישיים
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
                disabled={loading}
              />
              <input
                type="text"
                name="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="שם משפחה"
                required
                className={styles.inputContainer}
                disabled={loading}
              />
            </div>
            <div className={styles.nameInputsRow}>
              <select 
                name="sex" 
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                required 
                className={styles.inputContainer}
                disabled={loading}
              >
                <option value="">בחר מין</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>
            
            {auth.currentUser?.email && (
              <div className={styles.userEmail}>
                <p>מחובר באמצעות: <strong>{auth.currentUser.email}</strong></p>
              </div>
            )}
            
            <button type="submit" disabled={loading}>
              {loading ? 'מבצע רישום...' : 'הרשמה'}
            </button>
          </form>
        )}

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