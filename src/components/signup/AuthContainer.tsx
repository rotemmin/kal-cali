import { useSignup } from '@/context/SignupContext';
import EmailSignupForm from './EmailSignupForm';
import GoogleSignupButton from './GoogleSignupButton';
import PersonalDetailsForm from './PersonalDetailsForm';
import LoginLink from './LoginLink';
import styles from './page.module.css';

export default function AuthContainer() {
  const { signupMethod, showEmailForm } = useSignup();

  return (
    <div className={styles.authContainer}>
      {signupMethod === 'google' ? (
        <>
          <GoogleSignupButton />
          <LoginLink variant="mainScreen" />
        </>
      ) : (
        showEmailForm ? (
          <EmailSignupForm />
        ) : (
          <PersonalDetailsForm />
        )
      )}
    </div>
  );
} 