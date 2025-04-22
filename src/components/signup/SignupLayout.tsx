import { SignupProvider } from '@/context/SignupContext';
import MainContainer from './MainContainer';
import AuthStateListener from './AuthStateListener';

export default function SignupLayout() {
  return (
    <SignupProvider>
      <AuthStateListener />
      <MainContainer />
    </SignupProvider>
  );
}