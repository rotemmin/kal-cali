import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    Auth,
    User,
    sendEmailVerification
} from "firebase/auth";
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    auth.config.authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    db = getFirestore(app);
} catch (error) {
    console.error("שגיאה באתחול Firebase:", error);
    throw error;
}

const googleProvider = new GoogleAuthProvider();

export const sendVerificationEmail = async (user: User) => {
    try {
        await sendEmailVerification(user, {
            url: 'http://localhost:3000/login',
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
        return result.user;
    } catch (error) {
        console.error("שגיאה בהתחברות עם גוגל:", error);
        throw error;
    }
};

export const logoutUser = async (): Promise<boolean> => {
    try {
        await signOut(auth);
        return true;
    } catch (error) {
        console.error("שגיאה בהתנתקות:", error);
        throw error;
    }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

export { app, auth, db };