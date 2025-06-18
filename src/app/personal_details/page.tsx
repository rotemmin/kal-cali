"use client";
 
import { useEffect, useState } from "react";
import { auth, db, validatePassword, getPasswordStrength } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import Header from "@/components/general/Header";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
 
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

  const handleSave = async () => {
    if (!auth.currentUser) {
      setError("לא נמצא משתמש מחובר");
      return;
    }
    
    if (editForm.password && !isPasswordValid) {
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

      if (editForm.password && isPasswordValid) {
        try {
          await updatePassword(auth.currentUser, editForm.password);
          setSuccessMessage("הסיסמה עודכנה בהצלחה");
        } catch (passwordError: any) {
          if (passwordError.code === 'auth/requires-recent-login') {
            setError('נדרשת התחברות מחדש כדי לשנות סיסמה');
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
  };

  const handlePasswordChange = (newPassword: string) => {
    setEditForm(prev => ({ ...prev, password: newPassword }));
  };
 
  return (
    <div className={styles.container}>
      <Header />
      <X
        className={styles.closeButtonPersonalDetails}
        onClick={() => router.back()}
      />
      <div className={styles.content}>
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        <div className={styles.titleContainer}>
          <h1 className={styles.title}>פרטים אישיים</h1>
          <div className={styles.buttonContainer}>
            {isEditing ? (
              <>
                <button
                  className={`${styles.editButton} ${styles.cancelButton}`}
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  ביטול
                </button>
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
                  {isEditing ? (isSaving ? "שומר..." : "שמור") : "עריכה"}
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
                    <PasswordInput
                      value={editForm.password || ''}
                      onChange={handlePasswordChange}
                      onValidationChange={setIsPasswordValid}
                      placeholder="סיסמה חדשה"
                    />
                  </div>
                ) : (
                  <div className={styles.passwordDisplay}>
                    <div className={styles.value}>{user?.password || "********"}</div>
                    {isEditing && (
                      <button
                        type="button"
                        className={styles.changePasswordButton}
                        onClick={() => setIsChangingPassword(true)}
                      >
                        לחץ להחלפת סיסמא
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
            </div>
 
            <div className={styles.detailItem}>
              <div className={styles.subHeading}>לשון פנייה</div>
              {isEditing ? (
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                  className={styles.select}
                >
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                </select>
              ) : (
                <div className={styles.value}>
                  {user.gender === "male" ? "זכר" : "נקבה"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
 
export default PersonalDetails;