import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  Auth, 
  User, 
  sendEmailVerification,
  browserLocalPersistence,
  setPersistence
} from "firebase/auth";
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
} from 'firebase/firestore';

// תצורת Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  
  auth = getAuth(app);
  auth.useDeviceLanguage(); 
  
  if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) {
    auth.config.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  }
  
  setPersistence(auth, browserLocalPersistence).catch(error => {
    console.error("שגיאה בהגדרת פרסיסטנטיות:", error);
  });
  
  db = getFirestore(app);
  
} catch (error) {
  console.error("שגיאה באתחול Firebase:", error);
  throw error;
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',  
});

export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user, {
      url: typeof window !== 'undefined' ? `${window.location.origin}/login` : 'http://localhost:3000/login',
      handleCodeInApp: false,
    });
  } catch (error) {
    console.error("שגיאה בשליחת מייל אימות:", error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    try {
        const userMetadataRef = doc(db, 'user_metadata', result.user.uid);
        const userMetadataDoc = await getDoc(userMetadataRef);
      
      if (!userMetadataDoc.exists()) {
        await setDoc(userMetadataRef, {
          id: result.user.uid,
          email: result.user.email,
          created_at: serverTimestamp(),
          lastLogin: serverTimestamp(),
          profileComplete: false
        }); 

        await setDoc(doc(db, "user_activity", result.user.uid), {
            id: result.user.uid,
            activity_type: "initial_signup",
            curr_topic: 0,
            curr_milestone: 0,
            budget: 0,
          });
        } else {
          // עדכון זמן התחברות אחרון
          await setDoc(userMetadataRef, {
            lastLogin: serverTimestamp()
          }, { merge: true });
        }
    } catch (firestoreError) {
    console.error("שגיאה בשמירת נתוני משתמש:", firestoreError);
    // לא זורקים שגיאה כאן די לא לחסום את תהליך ההתחברות
    }
    
    return result.user;
  } catch (error: any) {
    console.error("שגיאה בהתחברות עם גוגל:", error);
    console.error("קוד שגיאה:", error.code);
    console.error("הודעת שגיאה:", error.message);
    throw error;
  }
};

// פונקציה להתנתקות
export const logoutUser = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("שגיאה בהתנתקות:", error);
    throw error;
  }
};

// פונקציה להאזנה לשינויים במצב ההתחברות
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// פונקציה לבדיקה אם פרופיל המשתמש מלא
export const isProfileComplete = async (userId: string): Promise<boolean> => {
  try {
    const userMetadataRef = doc(db, 'user_metadata', userId);
    const userMetadataDoc = await getDoc(userMetadataRef );
    
    if (!userMetadataDoc.exists()) {
      return false;
    }
    
    const userData = userMetadataDoc.data();
    return userData?.profileComplete === true;
  } catch (error) {
    console.error("שגיאה בבדיקת שלמות פרופיל:", error);
    return false;
  }
};

export const updateUserProfile = async (userId: string, userData: any): Promise<boolean> => {
  try {
    const userMetadataRef = doc(db, 'user_metadata', userId);
    await setDoc(userMetadataRef, {
        ...userData,
        updated_at: serverTimestamp(),
        profileComplete: true
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("שגיאה בעדכון פרטי המשתמש:", error);
    return false;
  }
};

export { app, auth, db };

// strong password requirements
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_REQUIRES_NUMBERS = true;
export const PASSWORD_REQUIRES_SPECIAL_CHARS = true;
export const PASSWORD_REQUIRES_UPPERCASE = true;

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`הסיסמה חייבת להיות באורך ${PASSWORD_MIN_LENGTH} תווים לפחות`);
  }
  
  if (PASSWORD_REQUIRES_NUMBERS && !/\d/.test(password)) {
    errors.push('הסיסמה חייבת לכלול מספר אחד לפחות');
  }
  
  if (PASSWORD_REQUIRES_SPECIAL_CHARS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('הסיסמה חייבת לכלול תו מיוחד אחד לפחות: !@#$%^&*(),.?":{}|<>');
  }
  
  if (PASSWORD_REQUIRES_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('הסיסמה חייבת לכלול אות גדולה אחת לפחות באנגלית');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPasswordStrength = (password: string): { strength: number; label: string } => {
  if (!password) return { strength: 0, label: '' };
  
  let strength = 0;
  
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  if (/\d/.test(password)) strength += 1;  
  if (/[a-z]/.test(password)) strength += 1;  
  if (/[A-Z]/.test(password)) strength += 1;  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;  
  

  let label = '';
  if (strength <= 2) label = 'חלשה';
  else if (strength <= 4) label = 'בינונית';
  else label = 'חזקה';
  
  return { 
    strength: Math.min(Math.floor((strength / 6) * 100), 100), 
    label 
  };
};