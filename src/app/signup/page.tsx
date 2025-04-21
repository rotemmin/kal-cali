'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db, signInWithGoogle, sendVerificationEmail } from '@/lib/firebase';
import styles from './page.module.css';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

export default function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupMethod, setSignupMethod] = useState('google');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true); // מצב חדש לבקרת תצוגת טפסים
  const router = useRouter();

  // בדיקה אם המשתמש כבר מחובר
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        
        // בדיקה אם המשתמש כבר השלים את פרטי הפרופיל
        const checkProfileStatus = async () => {
          try {
            if (user.uid) {
              const userMetadataRef = doc(db, "user_metadata", user.uid);
              const userMetadataDoc = await getDoc(userMetadataRef);
              
              // אם יש כבר פרופיל מלא, נווט ישירות לדף הבית
              if (userMetadataDoc.exists() && userMetadataDoc.data().profileComplete) {
                router.push('/homePage');
              }
            }
          } catch (error) {
            console.error("שגיאה בבדיקת סטטוס פרופיל:", error);
          }
        };
        
        // בדוק סטטוס פרופיל רק אם לא נשלח כרגע אימות מייל
        if (!verificationSent) {
          checkProfileStatus();
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, [router, verificationSent]);

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google sign up error:', error);

      if (error instanceof FirebaseError) {
        if (error.code === 'permission-denied') {
          setError('שגיאת הרשאות: אין מספיק הרשאות לגישה לבסיס הנתונים. אנא פנה למנהל המערכת.');
        } else {
          setError('שגיאה בהתחברות עם גוגל: ' + (error.message || ''));
        }
      } else {
        setError('שגיאה לא ידועה בהתחברות עם גוגל');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('יש למלא כתובת מייל וסיסמא');
      setLoading(false);
      return;
    }

    try {
      // יצירת משתמש חדש עם מייל וסיסמה
      await createUserWithEmailAndPassword(auth, email, password);
      
      // מעבר לטופס מילוי פרטים אישיים
      setShowEmailForm(false);
      
    } catch (error) {
      console.error('Email sign up error:', error);

      let errorMessage = 'אירעה שגיאה בהרשמה';

      if (error instanceof FirebaseError) {
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'המייל כבר קיים';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'כתובת המייל אינה תקינה';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'הסיסמה חלשה מדי';
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!firstName.trim() || !familyName.trim() || !gender) {
      setError('יש למלא את כל השדות');
      setLoading(false);
      return;
    }
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('משתמש לא מחובר. אנא התחבר שוב');
      }
      
      const userId = user.uid;
      
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

      try {
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
          gender: gender,
          email: user.email,
          created_at: new Date(),
          profileComplete: true
        });

        // בדיקה אם המשתמש נרשם עם מייל (בשונה מגוגל)
        const isEmailRegistration = signupMethod === 'email';
        
        if (isEmailRegistration) {
          // שליחת אימות למייל רק אחרי מילוי כל הפרטים
          await sendVerificationEmail(user);
          setVerificationSent(true);
        } else {
          // אם נרשם עם גוגל, נווט ישירות לדף הבית
          router.push('/homePage');
        }
      } catch (firestoreError) {
        console.error('Firestore operation error:', firestoreError);
        if (firestoreError instanceof FirebaseError && firestoreError.code === 'permission-denied') {
          throw new Error('אין לך הרשאות מספיקות לביצוע פעולה זו. אנא פנה למנהל המערכת.');
        }
        throw firestoreError;
      }
    } catch (error) {
      console.error('Error during signup:', error);
      if (error instanceof Error) {
        setError(error.message || 'אירעה שגיאה בתהליך ההרשמה');
      } else {
        setError('אירעה שגיאה לא ידועה בתהליך ההרשמה');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleSignupMethod = () => {
    setSignupMethod(signupMethod === 'google' ? 'email' : 'google');
    setError('');
    setVerificationSent(false);
    setShowEmailForm(true); // איפוס תצוגת הטופס בעת החלפת שיטת ההרשמה
  };

  // נווט לדף התחברות
  const goToLogin = () => {
    router.push('/login');
  };

  if (verificationSent) {
    // מסך אימות מייל - מוצג רק אחרי מילוי כל הפרטים
    return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.verificationContainer}>
            <div className={styles.verificationIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </div>
            <h3 className={styles.verificationTitle}>אימות המייל נשלח!</h3>
            <p className={styles.verificationText}>
              שלחנו הודעת אימות לכתובת: <strong>{auth.currentUser?.email}</strong>
            </p>
            <p className={styles.verificationInstructions}>
              אנא בדקו את תיבת הדואר הנכנס שלכם (וגם את תיקיית הספאם) ולחצו על הקישור לאימות כתובת המייל.
            </p>
            <p className={styles.verificationNote}>
              לאחר האימות, תוכלו להתחבר למערכת ולהתחיל להשתמש באפליקציה.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <p className={styles.introText}>מלאו את הפרטים הבאים כדי להתחיל</p>
        
        {!isAuthenticated ? (
          <div className={styles.authContainer}>
            {signupMethod === 'google' ? (
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

                <button 
                  type="button" 
                  onClick={toggleSignupMethod}
                  className={styles.toggleMethodButton}
                  disabled={loading}
                >
                  הרשמה עם מייל וסיסמה
                </button>
              </div>          
            ) : (
              // טופס הרשמה עם מייל וסיסמה
              showEmailForm ? (
                <form className={styles.emailSignupForm} onSubmit={handleEmailSignUp}>
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
                  
                  <button type="submit" disabled={loading}>
                    {loading ? 'מבצע רישום...' : 'המשך'}
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={toggleSignupMethod}
                    className={styles.toggleMethodButton}
                    disabled={loading}
                  >
                    הרשמה עם חשבון Google 
                  </button>
                </form>
              ) : (
                // טופס פרטים אישיים (יופיע רק אחרי השלמת הזנת מייל וסיסמה)
                <form className={styles.signupForm} onSubmit={handleProfileSubmit}>
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
                      name="gender" 
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      required 
                      className={styles.inputContainer}
                      disabled={loading}
                    >
                      <option value="">מה המגדר שלך?</option>
                      <option value="male">זכר</option>
                      <option value="female">נקבה</option>
                    </select>
                  </div>
                  
                  {auth.currentUser?.email && (
                    <div className={styles.userEmail}>
                      <p>מחובר באמצעות: <strong>{auth.currentUser.email}</strong></p>
                    </div>
                  )}
                  
                  <button type="submit" disabled={loading}>
                    {loading ? 'מבצע רישום...' : 'השלם הרשמה'}
                  </button>
                </form>
              )
            )}
          </div>
        ) : (
          // שלב 2: מילוי פרטים אישיים (למתחברים עם גוגל)
          <form className={styles.signupForm} onSubmit={handleProfileSubmit}>
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
                name="gender" 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required 
                className={styles.inputContainer}
                disabled={loading}
              >
                <option value="">מה המגדר שלך?</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
              </select>
            </div>
            
            {auth.currentUser?.email && (
              <div className={styles.userEmail}>
                <p>מחובר באמצעות: <strong>{auth.currentUser.email}</strong></p>
              </div>
            )}
            
            <button type="submit" disabled={loading}>
              {loading ? 'מבצע רישום...' : 'השלם הרשמה'}
            </button>
          </form>
        )}

        {error && <p style={{ color: "red" }} className={styles.error}>{error}</p>}
        
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