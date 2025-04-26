import { useState, useEffect } from 'react';
import { validatePassword, getPasswordStrength, PASSWORD_MIN_LENGTH, 
  PASSWORD_REQUIRES_NUMBERS, PASSWORD_REQUIRES_UPPERCASE, PASSWORD_REQUIRES_SPECIAL_CHARS } from '@/lib/firebase';
import styles from './PasswordInput.module.css';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export default function PasswordInput({
  value,
  onChange,
  onValidationChange,
  placeholder = 'סיסמה',
  disabled = false,
  showRequirements = true,
  className = ''
}: PasswordInputProps) {
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  const [showPassword, setShowPassword] = useState(false);
  const passwordStrength = getPasswordStrength(value);

  useEffect(() => {
    if (value) {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
      onValidationChange?.(validation.isValid);
    } else {
      setPasswordValidation({ isValid: false, errors: [] });
      onValidationChange?.(false);
    }
  }, [value, onValidationChange]);

  return (
    <div className={`${styles.passwordContainer} ${className}`}>
      <div className={styles.inputWrapper}>
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${value && !passwordValidation.isValid ? styles.invalid : ''}`}
        />
        <button
          type="button"
          className={styles.togglePasswordButton}
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      
      {value && (
        <>
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
          
          {showRequirements && (
            <div className={styles.passwordRequirements}>
              <h4>דרישות סיסמא:</h4>
              <ul>
                <li className={value.length >= PASSWORD_MIN_LENGTH ? styles.fulfiled : ''}>
                  {PASSWORD_MIN_LENGTH} תווים לפחות
                </li>
                {PASSWORD_REQUIRES_NUMBERS && (
                  <li className={/\d/.test(value) ? styles.fulfiled : ''}>
                    מספר אחד לפחות
                  </li>
                )}
                {PASSWORD_REQUIRES_UPPERCASE && (
                  <li className={/[A-Z]/.test(value) ? styles.fulfiled : ''}>
                    אות גדולה אחת לפחות באנגלית
                  </li>
                )}
                {PASSWORD_REQUIRES_SPECIAL_CHARS && (
                  <li className={/[!@#$%^&*(),.?":{}|<>]/.test(value) ? styles.fulfiled : ''}>
                    תו מיוחד אחד לפחות: !@#$%^&amp;*(),.?&quot;:{}|&lt;&gt;
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
} 