'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, sendVerificationEmail } from '@/lib/firebase';
import styles from './page.module.css';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loginMethod, setLoginMethod] = useState('google'); // 'email' או 'google'
  const [showToggle, setShowToggle] = useState(true); 

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError('יש למלא את כל השדות');
      setLoading(false);
      return;
    }
    
    // אם המשתמש מגיע מקישור אימות מייל, אנחנו יודעים שהמייל כבר אומת
    const fromVerification = searchParams.get('mode') === 'verifyEmail';

    try {
      // התחברות באמצעות מייל וסיסמה
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // בדיקה אם המשתמש קיים וסיים את תהליך יצירת הפרופיל
      const userMetadataRef = doc(db, "user_metadata", user.uid);
      const userMetadataDoc = await getDoc(userMetadataRef);

      if (userMetadataDoc.exists() && userMetadataDoc.data().profileComplete) {
        // אם המשתמש מגיע מקישור אימות, נתייחס אליו כמאומת ללא תלות בסטטוס ב-Firebase
        if (fromVerification) {
          console.log('משתמש מגיע מקישור אימות תקין - מתחבר ישירות');
          router.push('/homePage');
          return;
        }
        
        // אם לא מגיע מקישור אימות - רענן את המשתמש לקבלת סטטוס עדכני מהשרת
        try {
          // ננסה לרענן את המשתמש כדי לקבל סטטוס מעודכן מהשרת
          await user.reload();
          
          // בדיקה מחדש האם המייל מאומת
          if (user.emailVerified) {
            router.push('/homePage');
          } else {
            // אם עדיין לא מאומת, שלח הודעת שגיאה עם אפשרות לשלוח מייל אימות מחדש
            setError('יש לאמת את כתובת המייל לפני הכניסה למערכת');
          }
        } catch (reloadError) {
          console.error('שגיאה בריענון המשתמש:', reloadError);
          setError('אירעה שגיאה בבדיקת סטטוס אימות המייל. אנא נסה שוב מאוחר יותר.');
        }
      } else {
        // אם המשתמש לא השלים את פרטי הפרופיל, נווט אותו להשלמת הפרופיל
        router.push('/signup');
      }
    } catch (error) {
      console.error('Email login error:', error);
      
      let errorMessage = 'מייל או סיסמה אינם נכונים';
      
      if (error instanceof FirebaseError) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          errorMessage = 'שם משתמש או סיסמה לא נכונים';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'יותר מדי ניסיונות התחברות, אנא נסה שוב מאוחר יותר';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'כתובת מייל לא תקינה';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // בדיקה אם המשתמש מגיע מקישור אימות מייל
  useEffect(() => {
    // בודק אם יש פרמטר 'mode=verifyEmail' בכתובת ה-URL
    const mode = searchParams.get('mode');
    const fromVerification = mode === 'verifyEmail';
    
    // אם המשתמש מגיע מאימות מייל, הצג ישירות את טופס ההתחברות עם מייל
    if (fromVerification) {
      setLoginMethod('email');
      setShowToggle(false); // לא מציגים את כפתור המעבר לגוגל
      
      // נסה לקבל את המייל מה-URL (אם קיים)
      const verifiedEmail = searchParams.get('email');
      if (verifiedEmail) {
        setEmail(decodeURIComponent(verifiedEmail));
      }
      
      // אם המשתמש כבר מחובר, ננסה לרענן את הטוקן שלו
      // זה עוזר לפיירבייס לעדכן את סטטוס האימות
      const currentUser = auth.currentUser;
      if (currentUser) {
        currentUser.getIdToken(true)
          .then(() => {
            console.log("טוקן משתמש רוענן בהצלחה");
          })
          .catch(error => {
            console.error("שגיאה בריענון טוקן:", error);
          });
      }
    }
  }, [searchParams]);
  
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    
    try {
      // לבדוק אם כבר קיים משתמש עם המייל הזה בטבלת המשתמשים בפיירסטור
      // לפני שמנסים להתחבר עם גוגל ויוצרים משתמש חדש
      
      // במקום להשתמש בפונקציית signInWithGoogle, נשתמש באפשרות להציג רק 
      // את חלון הבחירה של גוגל כדי לקבל את המייל, ורק אז לבדוק אם הוא קיים במערכת
      
      // ראשית, נציג את חלון הבחירה של גוגל ונקבל את המידע על המשתמש
      const googleProvider = new (await import('firebase/auth')).GoogleAuthProvider();
      const result = await (await import('firebase/auth')).signInWithPopup(auth, googleProvider);
      
      // אם הגענו לכאן, המשתמש כבר קיים בטבלת האותנטיקציה (או נוצר כרגע)
      // אבל אנחנו רוצים לבדוק אם הוא קיים בטבלת המשתמשים בפיירסטור
      
      if (result.user) {
        // בדיקה אם המשתמש קיים בטבלת משתמשים בפיירסטור
        const userMetadataRef = doc(db, "user_metadata", result.user.uid);
        const userMetadataDoc = await getDoc(userMetadataRef);
        
        if (userMetadataDoc.exists()) {
          // אם המשתמש קיים בפיירסטור, בדוק אם הוא השלים את הפרופיל
          if (userMetadataDoc.data().profileComplete) {
            // אם כן, נווט לדף הבית
            router.push('/homePage');
          } else {
            // אם לא, נווט להשלמת הפרופיל
            router.push('/signup');
          }
        } else {
          // אם המשתמש לא קיים בפיירסטור, מציגים הודעה ומתנתקים
          setError('חשבון זה אינו רשום במערכת. אנא הירשם תחילה דרך דף ההרשמה.');
          // התנתקות מהמשתמש שנוצר בטבלת האותנטיקציה
          await auth.signOut();
        }
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // אם המשתמש ביטל את החלון של גוגל, לא נציג הודעת שגיאה
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // לא עושים כלום, המשתמש פשוט סגר את החלון
      } else {
        setError('שגיאה בהתחברות עם גוגל');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginMethod = () => {
    setLoginMethod(loginMethod === 'google' ? 'email' : 'google');
    setError("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1 className={`title-main ${styles.titleMain}`}>כניסה למערכת</h1>
        
        {loginMethod === 'google' ? (
          <div className={styles.googleLoginState}>
            <p className={`subtitle-main ${styles.googleLoginSubtitle}`}>בחר.י את דרך ההתחברות המועדפת</p>
            
            <button 
              className={styles.googleButton}
              onClick={handleGoogleLogin}
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
              <span className={styles.googleButtonText}>
                {loading ? 'מתחבר...' : 'התחברות עם Google'}
              </span>
            </button>
            
            {showToggle && (
              <button 
                type="button" 
                onClick={toggleLoginMethod}
                className={styles.toggleMethodButton}
                disabled={loading}
              >
                התחברות עם מייל וסיסמה &emsp; &emsp; 
              </button>
            )}
            
            <p className={`register-question ${styles.registerQuestionGoogle}`}>
              אין לך חשבון עדיין?
              <Link href="/signup" className={styles.registerLink}>הירשם.י כאן!</Link>
            </p>
          </div>
        ) : (
          <div className={styles.emailLoginContainer}>
            <p className={`subtitle-main ${styles.subtitleMain}`}>
              {searchParams.get('mode') === 'verifyEmail' 
                ? 'המייל שלך אומת בהצלחה! כעת ניתן להתחבר' 
                : 'התחברו באמצעות המייל והסיסמה שלכם.ן'}
            </p>
            
            <form className={styles.emailLoginForm} onSubmit={handleEmailLogin}>
              <div className={styles.inputRow}>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="כתובת מייל"
                  required
                  className={styles.inputContainer}
                  disabled={loading}
                />
              </div>
              <div className={styles.inputRow}>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  required
                  className={styles.inputContainer}
                  disabled={loading}
                />
              </div>
              
              <button type="submit" disabled={loading} className={styles.emailButton}>
                {loading ? 'מתחבר...' : 'התחברות'}
              </button>

              <div className={styles.forgotPassword}>
                <Link href="/forgot-password">
                  שכחתי סיסמה
                </Link>
              </div>
            </form>

            <p className={`register-question ${styles.registerQuestionEmail}`}>
              אין לך חשבון עדיין?
              <Link href="/signup" className={styles.registerLink}>הירשם.י כאן!</Link>
            </p>

            {showToggle && (
              <>
                <p className={styles.orText}>או</p>
                <button 
                  type="button" 
                  onClick={handleGoogleLogin}
                  className={styles.emailLoginGoogleButton}
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
                  <span className={styles.googleButtonText}>
                    {loading ? 'מתחבר...' : 'התחברו עם Google'}
                  </span>
                </button>
              </>
            )}

            {error === 'יש לאמת את כתובת המייל לפני הכניסה למערכת' && (
              <button 
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError("");
                    
                    if (auth.currentUser) {
                      await sendVerificationEmail(auth.currentUser);
                      setError('נשלח מייל אימות חדש. אנא בדוק את תיבת הדואר שלך.');
                    }
                  } catch (error) {
                    setError('שגיאה בשליחת מייל אימות. אנא נסה שוב מאוחר יותר.');
                    console.error('שגיאה בשליחת מייל אימות:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                className={styles.resendVerificationButton}
                disabled={loading}
              >
                שלח מייל אימות מחדש
              </button>
            )}
          </div>
        )}
        
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <LoginContent />
    </Suspense>
  );
}