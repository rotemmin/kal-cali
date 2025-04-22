import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useSignup } from '@/context/SignupContext';

export default function AuthStateListener() {
  const { setIsAuthenticated, verificationSent } = useSignup();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
        
        const checkProfileStatus = async () => {
          try {
            if (user.uid) {
              const userMetadataRef = doc(db, "user_metadata", user.uid);
              const userMetadataDoc = await getDoc(userMetadataRef);
              
              if (userMetadataDoc.exists() && userMetadataDoc.data().profileComplete) {
                router.push('/homePage');
              }
            }
          } catch (error) {
            console.error("שגיאה בבדיקת סטטוס פרופיל:", error);
          }
        };
        
        if (!verificationSent) {
          checkProfileStatus();
        }
      } else {
        setIsAuthenticated(false);
      }
    });
    
    return () => unsubscribe();
  }, [router, verificationSent, setIsAuthenticated]);

  return null;
} 