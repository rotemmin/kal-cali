import React, { useState, useEffect } from 'react';
import styles from './PasswordInput.module.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = 'סיסמה',
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    
    return strength;
  };

  const getStrengthText = (strength: number): string => {
    if (!value) return 'חלשה';
    if (strength < 50) return 'חלשה';
    if (strength < 100) return 'בינונית';
    return 'חזקה';
  };

  const getStrengthClass = (strength: number): string => {
    if (!value) return styles.weak;
    if (strength < 50) return styles.weak;
    if (strength < 100) return styles.weak;
    return styles.strong;
  };

  const isRequirementFulfilled = (requirement: string): boolean => {
    switch (requirement) {
      case 'length':
        return value.length >= 8;
      case 'number':
        return /[0-9]/.test(value);
      case 'special':
        return /[^A-Za-z0-9]/.test(value);
      case 'uppercase':
        return /[A-Z]/.test(value);
      default:
        return false;
    }
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(value));
    
    // Check if all requirements are met
    const isValid = isRequirementFulfilled('length') &&
                   isRequirementFulfilled('number') &&
                   isRequirementFulfilled('special') &&
                   isRequirementFulfilled('uppercase');
                   
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [value, onValidationChange]);

  return (
    <div className={styles.passwordContainer}>
      <div className={styles.inputWrapper}>
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={styles.input}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.togglePasswordButton}
          aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
          disabled={disabled}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </button>
      </div>
      
      <div className={styles.strengthBar}>
        <div 
          className={`${styles.strengthIndicator} ${getStrengthClass(passwordStrength)}`}
          style={{ width: `${passwordStrength}%` }}
        />
      </div>

      <div className={styles.strengthLabel}>
        רמת סיסמה: {getStrengthText(passwordStrength)}
      </div>
      
      <div className={styles.passwordRequirements}>
        <div className={styles.requirementsTitle}>דרישות סיסמה:</div>
        <ul>
          <li className={isRequirementFulfilled('length') ? styles.fulfilled : ''}>
            8 תווים לפחות
          </li>
          <li className={isRequirementFulfilled('number') ? styles.fulfilled : ''}>
            מספר אחד לפחות
          </li>
          <li className={isRequirementFulfilled('uppercase') ? styles.fulfilled : ''}>
            אות גדולה אחת לפחות באנגלית
          </li>
          <li className={isRequirementFulfilled('special') ? styles.fulfilled : ''}>
            תו מיוחד אחד לפחות: {'!@#$%^&*(),.?":{}|<>'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordInput; 