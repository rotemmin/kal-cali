import { useSignup } from '@/context/SignupContext';
import styles from './page.module.css';

export default function PersonalDetailsForm() {
  const {
    firstName,
    setFirstName,
    familyName,
    setFamilyName,
    isMale,
    setIsMale,
    loading,
    handleProfileSubmit
  } = useSignup();

  return (
    <form className={styles.personalDetailsForm} onSubmit={handleProfileSubmit}>
      <div className={styles.personalNameInputsRow}>
        <input
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="שם פרטי*"
          required
          className={styles.personalInputContainer}
          disabled={loading}
        />
        <input
          type="text"
          name="familyName"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="שם משפחה*"
          required
          className={styles.personalInputContainer}
          disabled={loading}
        />
      </div>

      <div className={styles.requiredFieldsText}>*שדות חובה</div>

      <div className={styles.personalGenderToggleContainer}>
        <div className={styles.personalGenderToggle}>
          <label className={styles.personalToggleSwitch}>
            <input 
              type="checkbox"
              checked={isMale}
              onChange={() => setIsMale(!isMale)}
              disabled={loading} 
            />
            <span className={styles.personalToggleSlider}></span>
          </label>
        </div>
      </div>
      
      <button type="submit" className={styles.personalSubmitButton} disabled={loading}>
        {loading ? 'מבצע רישום...' : 'הרשמה'}
      </button>
    </form>
  );
} 