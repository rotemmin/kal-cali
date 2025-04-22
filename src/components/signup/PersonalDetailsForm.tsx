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
    <form className={styles.signupForm} onSubmit={handleProfileSubmit}>
      <div className={styles.nameInputsRow}>
        <input
          type="text"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="שם פרטי"
          required
          className={styles.inputContainer}
          disabled={loading}
        />
        <input
          type="text"
          name="familyName"
          value={familyName}
          onChange={(e) => setFamilyName(e.target.value)}
          placeholder="שם משפחה"
          required
          className={styles.inputContainer}
          disabled={loading}
        />
      </div>

      <div className={styles.nameInputsRow}>
        <div className={styles.genderToggleConteiner}>
          {!isMale && <span className={styles.genderActive}>נקבה</span>}
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox"
              checked={isMale}
              onChange={() => setIsMale(!isMale)}
              disabled={loading} 
            />
            <span className={styles.toggleSlider}></span>
          </label>
          {isMale && <span className={styles.ganderActive}>זכר</span>}
        </div>
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'מבצע רישום...' : 'השלם הרשמה'}
      </button>
    </form>
  );
} 