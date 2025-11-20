"use client";
 
import { useEffect, useState } from "react";
import { auth, db, validatePassword, getPasswordStrength } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Header from "@/components/general/Header";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import ToggleSwitch from "@/components/general/ToggleSwitch";
import { FaEye, FaEyeSlash } from "react-icons/fa";
 
interface UserData {
  name: string;
  email: string;
  gender: string;
  password: string;
  first_name: string;
  second_name: string;
  isGoogleUser: boolean;
}
 
const PersonalDetails = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [originalForm, setOriginalForm] = useState<Partial<UserData>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: false, errors: [] });
  const [passwordStrength, setPasswordStrength] = useState<{ strength: number; label: string }>({ strength: 0, label: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const router = useRouter();
 
  useEffect(() => {
    const fetchUserDetails = async () => {
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        try {
          const userMetadataRef = doc(db, "user_metadata", currentUser.uid);
          const userMetadataDoc = await getDoc(userMetadataRef);
 
          if (userMetadataDoc.exists()) {
            const data = userMetadataDoc.data();
            const isGoogleUser = currentUser.providerData.some(
              provider => provider.providerId === 'google.com'
            );
            
            const userData = {
              first_name: data.first_name ?? "",
              second_name: data.second_name ?? "",
              name: `${data.first_name ?? "לא ידוע"} ${data.second_name ?? ""}`.trim(),
              email: currentUser.email ?? "לא ידוע",
              gender: data.gender ?? "לא ידוע",
              password: "********",
              isGoogleUser
            };
            setUser(userData);
            setEditForm({
              first_name: data.first_name ?? "",
              second_name: data.second_name ?? "",
              gender: data.gender ?? "לא ידוע"
            });
            setOriginalForm({
              first_name: data.first_name ?? "",
              second_name: data.second_name ?? "",
              gender: data.gender ?? "לא ידוע"
            });
          }
        } catch (error) {
          console.error("שגיאה בטעינת פרטי המשתמש:", error);
        }
      }
    };
    
    fetchUserDetails();
  }, []);

  const passwordError = error && error.includes("סיס") ? error : null;
  const generalError = error && !error.includes("סיס") ? error : null;

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError("לא נמצא משתמש מחובר");
      return;
    }
    
    if (isChangingPassword) {
      if (!currentPassword.trim()) {
        setError("אנא הזן את הסיסמה הנוכחית");
        return;
      }

      if (!isPasswordValid) {
        setError("הסיסמה אינה עומדת בדרישות האבטחה");
        return;
      }
    } else if (editForm.password && !isPasswordValid) {
      setError("הסיסמה אינה עומדת בדרישות האבטחה");
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);
    
    try {
      const userMetadataRef = doc(db, "user_metadata", auth.currentUser.uid);
      const updates: any = {
        first_name: editForm.first_name,
        second_name: editForm.second_name,
        gender: editForm.gender
      };

      if (isChangingPassword && editForm.password && isPasswordValid) {
        try {
          const email = auth.currentUser.email;
          if (!email) {
            setError("לא הצלחנו לאמת את הסיסמה הנוכחית. אנא התחבר מחדש ונסה שוב.");
            return;
          }

          const credential = EmailAuthProvider.credential(email, currentPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await updatePassword(auth.currentUser, editForm.password);
          setSuccessMessage("הסיסמה עודכנה בהצלחה");
        } catch (passwordError: any) {
          if (passwordError.code === 'auth/wrong-password') {
            setError('הסיסמה הנוכחית שגויה');
            return;
          } else if (passwordError.code === 'auth/requires-recent-login') {
            setError('נדרשת התחברות מחדש כדי לשנות סיסמה');
            return;
          } else if (passwordError.code === 'auth/weak-password') {
            setError('הסיסמה אינה עומדת בדרישות האבטחה');
            return;
          } else if (passwordError.code === 'auth/invalid-credential') {
            setError('הסיסמה הנוכחית אינה תקינה');
            return;
          } else {
            setError('שגיאה בעדכון הסיסמה');
            return;
          }
        }
      }

      await updateDoc(userMetadataRef, updates);

      setUser(prev => prev ? {
        ...prev,
        first_name: editForm.first_name ?? prev.first_name,
        second_name: editForm.second_name ?? prev.second_name,
        name: `${editForm.first_name ?? prev.first_name} ${editForm.second_name ?? prev.second_name}`.trim(),
        gender: editForm.gender ?? prev.gender
      } : null);
      
      setIsEditing(false);
      setIsChangingPassword(false);
      setCurrentPassword("");
      setEditForm(prev => {
        const { password, ...rest } = prev;
        return rest;
      });
      setSuccessMessage(prev => prev || "הפרטים נשמרו בהצלחה");
      
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
    } catch (error) {
      console.error("שגיאה בשמירת הפרטים:", error);
      setError("שגיאה בשמירת הפרטים");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(originalForm);
    setIsEditing(false);
    setIsChangingPassword(false);
    setPasswordValidation({ isValid: false, errors: [] });
    setPasswordStrength({ strength: 0, label: '' });
    setCurrentPassword("");
    setIsPasswordValid(false);
    setError(null);
    setShowCurrentPassword(false);
  };

  const handlePasswordChange = (newPassword: string) => {
    setEditForm(prev => ({ ...prev, password: newPassword }));
  };

  const handleStartPasswordChange = () => {
    setCurrentPassword("");
    setEditForm(prev => ({ ...prev, password: "" }));
    setIsPasswordValid(false);
    setIsChangingPassword(true);
    setPasswordValidation({ isValid: false, errors: [] });
    setError(null);
    setShowCurrentPassword(false);
  };
 
  return (
    <div className={styles.container}>
      <Header />
      <X
        className={styles.closeButtonPersonalDetails}
        onClick={() => router.back()}
      />
      <div className={styles.content}>
        {generalError && (
          <div className={styles.errorMessage}>
            {generalError}
          </div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        <h1 className={styles.title}>פרטים אישיים</h1>
        {user && (
          <div className={styles.details}>
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>שם פרטי</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                  className={styles.input}
                  placeholder="שם פרטי"
                  size={Math.max((editForm.first_name || '').length, 4)}
                />
              ) : (
                <div className={styles.value}>{user.first_name || "לא ידוע"}</div>
              )}
            </div>

            <div className={styles.detailItem}>
              <div className={styles.subHeading}>שם משפחה</div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.second_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, second_name: e.target.value }))}
                  className={styles.input}
                  placeholder="שם משפחה"
                  size={Math.max((editForm.second_name || '').length, 4)}
                />
              ) : (
                <div className={styles.value}>{user.second_name || "לא ידוע"}</div>
              )}
            </div>
 
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>כתובת מייל</div>
              <div className={styles.value}>{user.email}</div>
            </div>
 
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>סיסמה</div>
              {!user?.isGoogleUser && (
                isEditing && isChangingPassword ? (
                  <div className={styles.passwordContainer}>
                    <div className={styles.passwordFieldGroup}>
                      <label className={styles.passwordLabel} htmlFor="currentPassword">
                        סיסמה נוכחית
                      </label>
                      <div className={styles.passwordInputWrapper}>
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className={styles.passwordInput}
                          placeholder="הקלד את הסיסמה הנוכחית"
                          autoComplete="current-password"
                          disabled={isSaving}
                        />
                        <button
                          type="button"
                          className={styles.togglePasswordButtonInline}
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          aria-label={showCurrentPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                          disabled={isSaving}
                        >
                          {showCurrentPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.passwordFieldGroup}>
                      <div className={styles.passwordLabel}>סיסמה חדשה</div>
                      <PasswordInput
                        value={editForm.password || ''}
                        onChange={handlePasswordChange}
                        onValidationChange={setIsPasswordValid}
                        placeholder="בחר סיסמה חדשה"
                        disabled={isSaving}
                      />
                    </div>

                  </div>
                ) : (
                  <div className={styles.passwordDisplay}>
                    <div className={styles.value}>{user?.password || "********"}</div>
                    {isEditing && (
                      <button
                        type="button"
                        className={styles.changePasswordButton}
                        onClick={handleStartPasswordChange}
                      >
                        החלפת סיסמא
                      </button>
                    )}
                  </div>
                )
              )}
              {user?.isGoogleUser && (
                <div className={styles.googleAuthMessage}>
                  משתמש מחובר באמצעות חשבון Google
                </div>
              )}
              {passwordError && (
                <div className={styles.passwordInlineError}>
                  {passwordError}
                </div>
              )}
            </div>
 
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>לשון פנייה</div>
              {isEditing ? (
                <div className={styles.value}>
                  <ToggleSwitch
                    checked={(editForm.gender || user.gender) === 'male'}
                    onChange={(checked) =>
                      setEditForm(prev => ({ ...prev, gender: checked ? 'male' : 'female' }))
                    }
                  />
                </div>
              ) : (
                <div className={styles.value}>
                  {user.gender === "male" ? "זכר" : "נקבה"}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={styles.buttonContainer}>
          {isEditing ? (
            <>
              <button
                className={styles.editButton}
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                  }
                }}
                disabled={isSaving}
              >
                {isEditing ? (isSaving ? "שומרים..." : "שמירה") : "עריכה"}
              </button>
              <button
                className={`${styles.editButton} ${styles.cancelButton}`}
                onClick={handleCancel}
                disabled={isSaving}
              >
                ביטול
              </button>
            </>
          ) : (
            <button
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              עריכה
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default PersonalDetails;