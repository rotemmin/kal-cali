import { useSignup } from '@/context/SignupContext';
import PersonalDetailsForm from './PersonalDetailsForm';
import VerificationMessage from './VerificationMessage';
import ErrorMessage from './ErrorMessage';
import IntroText from './IntroText';
import AuthContainer from './AuthContainer';
import styles from './page.module.css';

export default function MainContainer() {
  const { isAuthenticated, verificationSent } = useSignup();

  if (verificationSent) {
    return <VerificationMessage />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <IntroText />
        {!isAuthenticated ? (
          <AuthContainer />
        ) : (
          <PersonalDetailsForm />
        )}
        <ErrorMessage />
      </div>
    </div>
  );
} 