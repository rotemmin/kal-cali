import { useSignup } from '@/context/SignupContext';
import { validatePassword, getPasswordStrength, PASSWORD_MIN_LENGTH, 
  PASSWORD_REQUIRES_NUMBERS, PASSWORD_REQUIRES_UPPERCASE, PASSWORD_REQUIRES_SPECIAL_CHARS } from '@/lib/firebase';
import styles from './EmailSignupForm.module.css';
import { useState, useEffect } from 'react';

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

  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const passwordStrength = getPasswordStrength(password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    if (password) {
      const validation = validatePassword(password);
      setPasswordValidation(validation);
      setIsPasswordValid(validation.isValid);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
      setIsPasswordValid(false);
    }
  }, [password]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (newEmail && !validateEmail(newEmail)) {
      setIsEmailValid(false);
      setError('כתובת האימייל אינה תקינה');
    } else {
      setIsEmailValid(true);
      setError('');
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
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          required
          className={`${styles.inputContainer} ${password && !isPasswordValid ? styles.invalid : ''}`}
          disabled={loading}
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
        />
      </div>
      
      {password && (
        <div className={styles.passwordStrength}>
          <div className={styles.strengthBar}>
            <div 
              className={`${styles.strengthIndicator} ${
                passwordStrength.strength <= 33 ? styles.weak : 
                passwordStrength.strength <= 66 ? styles.medium : styles.strong
              }`} 
              style={{ width: `${passwordStrength.strength}%` }}
            ></div>
          </div>
          <span className={styles.strengthLabel}>
            {passwordStrength.label ? `רמת סיסמא: ${passwordStrength.label}` : ''}
          </span>
        </div>
      )}
      
      {(passwordFocus || password) && (
        <div className={styles.passwordRequirements}>
          <h4>דרישות סיסמא:</h4>
          <ul>
            <li className={password.length >= PASSWORD_MIN_LENGTH ? styles.fulfiled : ''}>
              {PASSWORD_MIN_LENGTH} תווים לפחות
            </li>
            {PASSWORD_REQUIRES_NUMBERS && (
              <li className={/\d/.test(password) ? styles.fulfiled : ''}>
                מספר אחד לפחות
              </li>
            )}
            {PASSWORD_REQUIRES_UPPERCASE && (
              <li className={/[A-Z]/.test(password) ? styles.fulfiled : ''}>
                אות גדולה אחת לפחות באנגלית
              </li>
            )}
            {PASSWORD_REQUIRES_SPECIAL_CHARS && (
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? styles.fulfiled : ''}>
                תו מיוחד אחד לפחות: !@#$%^&amp;*(),.?&quot;:{}|&lt;&gt;
              </li>
            )}
          </ul>
        </div>
      )}
      
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
        הרשמה עם חשבון Google 
      </button>
    </form>
  );
} 