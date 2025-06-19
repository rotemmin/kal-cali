import { useSignup } from '@/context/SignupContext';
import ToggleSwitch from '@/components/general/ToggleSwitch';
import LoginLink from '@/components/signup/LoginLink';
import { useAuth } from '@/lib/firebase/auth';
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
  const { user } = useAuth();

  // בדיקה אם שדות החובה מלאים
  const isFormValid = firstName.trim() && familyName.trim();

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
      {user?.email && (
        <div className={styles.connectedEmailText}>
          מחובר באמצעות {user.email}
        </div>
      )}

      <div className={styles.personalGenderToggleContainer}>
        <div className={styles.personalGenderToggle}>
          <ToggleSwitch
            checked={isMale}
            onChange={setIsMale}
            disabled={loading}
            size="medium"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className={styles.personalSubmitButton} 
        disabled={loading || !isFormValid}
      >
        {loading ? 'המתן...' : 'הרשמה'}
      </button>

      <LoginLink variant="personalDetails" />
    </form>
  );
} 