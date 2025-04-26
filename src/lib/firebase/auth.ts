import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { app } from './client';

const auth = getAuth(app);

export const useAuth = () => {
  const [user, loading, error] = useAuthState(auth);
  return { user, loading, error };
}; 