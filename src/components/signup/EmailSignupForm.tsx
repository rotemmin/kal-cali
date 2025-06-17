import { useSignup } from '@/context/SignupContext';
import { validatePassword, getPasswordStrength, PASSWORD_MIN_LENGTH, 
  PASSWORD_REQUIRES_NUMBERS, PASSWORD_REQUIRES_UPPERCASE, PASSWORD_REQUIRES_SPECIAL_CHARS } from '@/lib/firebase';
import styles from './page.module.css';
import { useState, useEffect } from 'react';
import PasswordInput from '../PasswordInput';

export default function EmailSignupForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    passwordFocus,
    setPasswordFocus,
    loading,
    handleEmailSignUp,
    toggleSignupMethod,
    setError
  } = useSignup();

  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !validateEmail(newEmail)) {
      setIsEmailValid(false);
      setError('כתובת האימייל אינה תקינה');
    } else {
      setIsEmailValid(true);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!isEmailValid) {
      setError('יש להזין כתובת אימייל תקינה');
      return;
    }

    if (!isPasswordValid) {
      setError('יש לתקן את הסיסמה לפני ההמשך');
      return;
    }

    await handleEmailSignUp(e);
  };

  return (
    <form className={styles.emailSignupForm} onSubmit={handleSubmit}>
      <div className={styles.inputRow}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="כתובת מייל"
          required
          className={`${styles.inputContainer} ${!isEmailValid && email ? styles.invalid : ''}`}
          disabled={loading}
        />
      </div>

      <div className={styles.inputRow}>
        <PasswordInput
          value={password}
          onChange={setPassword}
          onValidationChange={setIsPasswordValid}
          placeholder="סיסמה"
          disabled={loading}
          showRequirements={Boolean(passwordFocus || password)}
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading || !isPasswordValid}
        className={`${styles.submitButton} ${!isPasswordValid ? styles.disabledButton : ''}`}
      >
        {loading ? 'מבצע רישום...' : 'המשך'}
      </button>
      
      <button 
        type="button" 
        onClick={toggleSignupMethod}
        className={styles.toggleMethodButton}
        disabled={loading}
      >
        הרשמה עם Google 
      </button>
    </form>
  );
} 