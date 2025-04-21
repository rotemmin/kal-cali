'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserGenderContextType {
  gender: string | null;
  setGender: (gender: string | null) => void;
}

const UserGenderContext = createContext<UserGenderContextType>({
  gender: null,
  setGender: () => {}
});

export const useUserGender = () => useContext(UserGenderContext);

export const UserGenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGender = async () => {
      const user = auth.currentUser;
      
      if (!user) return;
      
      const userDocRef = doc(db, "user_metadata", user.uid);
      
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setGender(userData.segenderx);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    
    fetchUserGender();
  }, []);

  return (
    <UserGenderContext.Provider value={{ gender, setGender }}>
      {children}
    </UserGenderContext.Provider>
  );
}; 