import React from 'react';
import styles from './ToggleSwitch.module.css';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  leftLabel?: string;
  rightLabel?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  leftLabel = 'נקבה',
  rightLabel = 'זכר',
  className = '',
  size = 'medium'
}: ToggleSwitchProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label className={`${styles.toggleSwitch} ${styles[size]} ${className}`}>
      <input 
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled} 
      />
      <span className={styles.toggleSlider}></span>
    </label>
  );
} 