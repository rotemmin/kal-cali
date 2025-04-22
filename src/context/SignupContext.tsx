import { createContext, useContext, useState, ReactNode } from 'react';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword, User } from 'firebase/auth';
import { auth, db, sendVerificationEmail, signInWithGoogle, validatePassword } from '@/lib/firebase';
import { setDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

interface SignupContextType {
  firstName: string;
  setFirstName: (name: string) => void;
  familyName: string;
  setFamilyName: (name: string) => void;
  isMale: boolean;
  setIsMale: (isMale: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordFocus: boolean;
  setPasswordFocus: (focus: boolean) => void;
  signupMethod: 'google' | 'email';
  setSignupMethod: (method: 'google' | 'email') => void;
  error: string;
  setError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  verificationSent: boolean;
  setVerificationSent: (sent: boolean) => void;
  showEmailForm: boolean;
  setShowEmailForm: (show: boolean) => void;
  handleGoogleSignUp: () => Promise<void>;
  handleEmailSignUp: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleProfileSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  toggleSignupMethod: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

export function SignupProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [isMale, setIsMale] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'google' | 'email'>('google');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(true);

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

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('יש למלא כתובת מייל וסיסמא');
      setLoading(false);
      return;
    }

    const validationResult = await validatePassword(password);
    if (!validationResult.isValid) {
      setError(validationResult.errors.join(', '));
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!firstName.trim() || !familyName.trim()) {
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

      await setDoc(doc(db, "user_activity", userId), {
        id: userId,
        activity_type: "initial_signup",
        topics_and_milestones: initialTopicsAndMilestones,
        curr_topic: 0,
        curr_milestone: 0,
        budget: 0,
      });
      
      await setDoc(doc(db, "user_metadata", userId), {
        id: userId,
        first_name: firstName.trim(),
        second_name: familyName.trim(),
        gender: isMale ? 'male': 'female',
        email: user.email,
        created_at: new Date(),
        profileComplete: true
      });

      const isEmailRegistration = signupMethod === 'email';
      
      if (isEmailRegistration) {
        await sendVerificationEmail(user);
        setVerificationSent(true);
      } else {
        router.push('/homePage');
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
    setShowEmailForm(true);
  };

  const value = {
    firstName,
    setFirstName,
    familyName,
    setFamilyName,
    isMale,
    setIsMale,
    email,
    setEmail,
    password,
    setPassword,
    passwordFocus,
    setPasswordFocus,
    signupMethod,
    setSignupMethod,
    error,
    setError,
    loading,
    setLoading,
    isAuthenticated,
    setIsAuthenticated,
    verificationSent,
    setVerificationSent,
    showEmailForm,
    setShowEmailForm,
    handleGoogleSignUp,
    handleEmailSignUp,
    handleProfileSubmit,
    toggleSignupMethod,
  };

  return (
    <SignupContext.Provider value={value}>
      {children}
    </SignupContext.Provider>
  );
}

export function useSignup() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignup must be used within a SignupProvider');
  }
  return context;
} 