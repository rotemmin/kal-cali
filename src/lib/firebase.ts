import { initializeApp, getApps } from 'firebase/app';
import { 
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    User,
    UserCredential,
    Auth,
    AuthError
} from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// הגדרת טיפוס של FirebaseError
interface FirebaseError extends Error {
  code: string;
  message: string;
  customData?: {
    email?: string;
  };
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export const registerWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user: User = userCredential.user;
      console.log("משתמש נרשם בהצלחה:", user);
      return user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("שגיאה בהרשמה:", firebaseError.code, firebaseError.message);
      throw error;
    }
};

export const loginWithEmailPassword = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user: User = userCredential.user;
      console.log("משתמש התחבר בהצלחה:", user);
      return user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("שגיאה בהתחברות:", firebaseError.code, firebaseError.message);
      throw error;
    }
};

export const signInWithGoogle = async (): Promise<User> => {
    try {
      const result: UserCredential = await signInWithPopup(auth, googleProvider);
      const user: User = result.user;
     
      // ניתן לגשת לטוקן של גוגל
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
     
      console.log("משתמש התחבר עם גוגל בהצלחה:", user);
      return user;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("שגיאה בהתחברות עם גוגל:", firebaseError.code, firebaseError.message);
      // מידע נוסף על השגיאה
      const email = firebaseError.customData?.email;
      const credential = GoogleAuthProvider.credentialFromError(error as AuthError);
      throw error;
    }
};
 
// ========== פונקציות משותפות ==========
 
// התנתקות מהמערכת
export const logoutUser = async (): Promise<boolean> => {
    try {
      await signOut(auth);
      console.log("משתמש התנתק בהצלחה");
      return true;
    } catch (error) {
      const firebaseError = error as FirebaseError;
      console.error("שגיאה בהתנתקות:", firebaseError.code, firebaseError.message);
      throw error;
    }
};
 
// האזנה לשינויים במצב האותנטיקציה
export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        // משתמש מחובר
        console.log("משתמש מחובר:", user);
        callback(user);
      } else {
        // משתמש מנותק
        console.log("אין משתמש מחובר");
        callback(null);
      }
    });
};
 
// קבלת המשתמש הנוכחי
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

export { app, auth, db };