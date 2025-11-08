"use client";
import React, { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { db } from "@/lib/firebase/client";
import { collection, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { debounce } from "lodash";
import styles from "./page.module.css";
import { Loader, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/general/Header";
import { useAuth } from "@/lib/firebase/auth";
import pensionData from '@/lib/content/topics/pension.json';
import nationalInsuranceData from '@/lib/content/topics/national_insurance.json';
import creditCardData from '@/lib/content/topics/credit_card.json';
import salaryData from '@/lib/content/topics/salary.json';  
import insuranceData from '@/lib/content/topics/insurance.json';
import taxData from '@/lib/content/topics/tax.json';


const englishToHebrewTopics: { [key: string]: string } = {
  pension: "פנסיה",
  national_insurance: "ביטוח לאומי",
  credit_card: "כרטיסי אשראי",
  tax: "מס הכנסה",
  salary: "תלושי שכר",
  insurance: "ביטוחים",
};

const topicFields = {
  pension: [
    { label: "חברת הפנסיה שלי", field: "company_advisor_name" },
    { label: "המסלול אליו אני משויכת", field: "management_saving_pages" },
    { label: "דמי הניהול המוצעים לי מהפקדה", field: "monthly_payments1" },
    { label: "דמי הניהול המוצעים לי מהצבירה", field: "monthly_payments2" },
    { label: "מה כלול בפנסיה שלי?", field: "additional_contact_details" },
    { label: "כמה הופרש עד כה לפנסיה שלי?", field: "general_description" },
    { label: "הסוכן שלי - שם, מייל/טלפון", field: "additional_contact_details" },
  ],
  national_insurance: [
    { label: "מה הסטטוס שלי?", field: "management_deposit_pages" },
    { label: "יש לי חוב? אם כן, כמה?", field: "debt_amount" },
    { label: "אחוז דמי הביטוח הלאומי", field: "national_insurance_percentage" },
    { label: "אחוז דמי הביטוח הבריאות", field: "health_insurance_percentage" },
    { label: "כמה כסף צברתי עד היום?", field: "total_savings" },
    { label: "לעצמאית - מה מועדי התשלום החייבים עליי?", field: "payment_status" },
    { label: "לשכירה - האם המעסיק משלם עליי?", field: "future_management_info" },
    { label: "הזכאות שלי מביטוח לאומי", field: "national_insurance_benefits" },
  ],
  credit_card: [
    { label: " ואילו כמה כרטיסי אשראי יש לי?", field: "credit_cards_amount" },
    { label: "מה המסגרת בכל כרטיס?", field: "card_limit" },
    { label: "מה עמלת ההמרה שלי?", field: "exchange_price" },
    { label: "האם ישנם דמי אחזקה לכרטיס?", field: "card_price" },
  ],
  tax: [
    { label: "המשכורת הממוצעת שלי", field: "avrage salary" },
    { label: "נקודות זיכוי מס המגיעות לי", field: "tax_discount" },
  ],
  insurance: [
    { label: "איפה ביטוח החיים שלי", field: "life_insuranfe" },
    { label: "איפה ביטוח הרכב שלי?", field: "car_insurance" },
    { label: "איזה סוג ביטוח רכב יש לי?", field: "car_insurance_type" },
    { label: "באיזו קופת חולים אני?", field: "clinic" },
    { label: "באיזה ביטוח בריאות פרטי אני?", field: "private_healthcare" },
    { label: "איפה ביטוח הדירה של?י?", field: "apartment_insurance" },
  ],
  salary: [
    { label: "ממוצע השכר החודשי שלי", field: "payment" },
    { label: "נקודות הזיכוי ממס הכנסה", field: "tax_discount" },
    { label: "מספר הטלפון של מחלקת שכר בעבודה", field: "phone_number" },
    { label: "השכר השעתי שלי", field: "hourly_salary" },
    { label: "כמה שעות עבדתי החודש?", field: "hours" },
    { label: "מה התוספת שאקבל על שעות נוספות?", field: "extra_hours" },
  ]
};

interface Topic {
  id: string;
  curr_topic: string;
  fromDb: boolean;
}

interface Sticker {
  type: 'littleStickersTitle' | 'littleStickersDrawing' | 'finalStickers' | 'finalStickersTitle' | 'finalStickersEmpty';
  path: string;
}

const topicDataMap = {
  pension: pensionData,
  national_insurance: nationalInsuranceData,
  credit_card: creditCardData,
  salary: salaryData,
  insurance: insuranceData,
  tax: taxData,
};

const milestoneOrders: { [topic: string]: string[] } = {};
Object.entries(topicDataMap).forEach(([topic, data]) => {
  milestoneOrders[topic] = data.milestones.map((m: any) => m.title.replace(/\s+/g, '_'));
});

function PersonalNotebookContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [loadingNote, setLoadingNote] = useState<boolean>(false);
  const [additionalFields, setAdditionalFields] = useState<Record<string, string>>({});
  const [milestones, setMilestones] = useState<any>({});
  const { user } = useAuth();
  const [gender, setGender] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Record<string, Sticker[]>>({});

  useEffect(() => {
    const topic = searchParams.get("topic");
    if (!currentTopic) {
      setCurrentTopic(topic);
    }
    window.history.replaceState(null, "", pathname);
  }, [searchParams]);

  useEffect(() => {
    const textarea = document.querySelector(`.${styles.notesTextarea}`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [noteText, currentTopic]);

  const fetchTopics = useCallback(async () => {
    try {
      if (!user?.uid) {
        console.error("User ID is null. Cannot fetch user activity.");
        return;
      }

      const userDocRef = doc(db, "user_activity", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const topicsData = data?.topics_and_milestones || {};
        setMilestones(topicsData);

        const dbTopics: Topic[] = Object.keys(topicsData).map((topic, index) => ({
          id: `db-${index}`,
          curr_topic: topic,
          fromDb: true,
        }));

        const predefinedTopics: Topic[] = Object.keys(englishToHebrewTopics).map(
          (topic, index) => ({
            id: `predefined-${index}`,
            curr_topic: topic,
            fromDb: false,
          })
        );

        const mergedTopics: Topic[] = [...dbTopics, ...predefinedTopics].reduce(
          (uniqueTopics, topic) => {
            if (!uniqueTopics.find((t) => t.curr_topic === topic.curr_topic)) {
              uniqueTopics.push(topic);
            }
            return uniqueTopics;
          },
          [] as Topic[]
        );

        setTopics(mergedTopics);
        if (!currentTopic || currentTopic === "O") {
          setCurrentTopic("pension");
        } else if (data?.curr_topic && !currentTopic) {
          setCurrentTopic(data.curr_topic);
        }
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את הנושאים");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, currentTopic]);

  const fetchNotes = useCallback(async () => {
    if (!user?.uid || !currentTopic) return;

    try {
      const noteDocRef = doc(db, "notes", `${user.uid}_${currentTopic}`);
      const noteDoc = await getDoc(noteDocRef);

      if (noteDoc.exists()) {
        const data = noteDoc.data();
        setNoteText(data.note || "");

        const newFields = Object.entries(data)
          .filter(([key]) => key.startsWith("field_"))
          .reduce((acc, [key, value]) => {
            acc[`${currentTopic}_${key}`] = value as string;
            return acc;
          }, {} as Record<string, string>);

        setAdditionalFields((prev) => ({
          ...prev,
          ...newFields,
        }));
      } else {
        setNoteText("");
        setAdditionalFields((prev) =>
          Object.fromEntries(
            Object.entries(prev).filter(
              ([key]) => !key.startsWith(`${currentTopic}_`)
            )
          )
        );
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את ההערות");
      console.error("Error fetching notes:", error);
    }
  }, [user?.uid, currentTopic]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (currentTopic) {
      setLoadingNote(true);
      fetchNotes().finally(() => {
        setLoadingNote(false);
      });
    }
  }, [fetchNotes, currentTopic]);

  useEffect(() => {
    if (!user) return;

    const loadStickers = async () => {
      try {
        const notebookRef = doc(db, "notebooks", user.uid);
        const notebookDoc = await getDoc(notebookRef);
        
        if (notebookDoc.exists()) {
          const data = notebookDoc.data();
          setStickers(data.stickers || {});
        }
      } catch (error) {
        console.error('Error loading stickers:', error);
      }
    };

    const unsubscribe = onSnapshot(
      doc(db, "notebooks", user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setStickers(data.stickers || {});
        }
      }
    );

    loadStickers();
    return () => unsubscribe();
  }, [user]);

  const getStickerImage = (topic: string, index: number) => {
    const topicMilestones = milestones[topic]?.milestones || {};
    const milestoneOrder = milestoneOrders[topic] || [];
    const isFirstMilestoneDone = topicMilestones[milestoneOrder[0]] === 1;
    const isSecondMilestoneDone = topicMilestones[milestoneOrder[1]] === 1;
    const isAllMilestonesDone = milestoneOrder.length > 0 && milestoneOrder.every(key => topicMilestones[key] === 1);

    if (index === 0) {
      if (isFirstMilestoneDone && gender) {
        return `/stickers/littleStickersTitle/${gender}/title_${topic}.svg`;
      }
      return `/stickers/littleStickersTitle/pre_title_${topic}.svg`;
    }

    if (index === 1) {
      if (isSecondMilestoneDone) {
        return `/stickers/littleStickersDrawing/drawing_${topic}.svg`;
      }
      return `/stickers/littleStickersDrawing/pre_drawing_${topic}.svg`;
    }

    if (index === 2) {
      if (isAllMilestonesDone) {
        return `/stickers/finalStickers/final_${topic}.svg`;
      }
      return `/stickers/finalStickersEmpty/empty_${topic}.svg`;
    }

    return '';
  };

  const debouncedUpdateNote = useMemo(
    () =>
      debounce(async (userId: string, topicInEnglish: string, newNote: string) => {
        try {
          if (!userId || !topicInEnglish) return;
          const noteDocRef = doc(db, "notes", `${userId}_${topicInEnglish}`);
          await setDoc(noteDocRef, {
            note: newNote,
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save note:", error);
        }
      }, 500),
    []
  );

  const debouncedUpdateField = useMemo(
    () =>
      debounce(async (userId: string, topicInEnglish: string, field: string, value: string) => {
        try {
          if (!userId || !topicInEnglish) return;
          const noteDocRef = doc(db, "notes", `${userId}_${topicInEnglish}`);
          await setDoc(noteDocRef, {
            [field]: value,
          }, { merge: true });
        } catch (error) {
          console.error("Failed to save field:", error);
        }
      }, 500),
    []
  );

  const handleChangeTopic = (topic: string) => {
    setCurrentTopic(topic);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNoteText(newNote);

    debouncedUpdateNote(user?.uid!, currentTopic!, newNote);
  };

  const handleFieldChange = (field: string, value: string) => {
    const fieldKey = `${currentTopic}_${field}`;

    setAdditionalFields((prev) => ({ ...prev, [fieldKey]: value }));
    debouncedUpdateField(user?.uid!, currentTopic!, field, value);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const fetchUserGender = async () => {
      if (!user) return;

      try {
        const userMetadataRef = doc(db, "user_metadata", user.uid);
        const userMetadataDoc = await getDoc(userMetadataRef);

        if (userMetadataDoc.exists()) {
          const userData = userMetadataDoc.data();
          setGender(userData.gender);
        }
      } catch (error) {
        console.error("Error fetching user gender:", error);
      }
    };

    fetchUserGender();
  }, [user]);

  // Determine the correct placeholder text
  const notePlaceholder =
    gender === "male"
      ? "רשום כאן את ההערות שלך..."
      : "רשמי כאן את ההערות שלך...";

  return (
    <>
      <Header />
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loader className={`${styles.loadingNote} animate-spin`} />
        </div>
      ) : (
        <div className={styles.notebookContainer}>
          <X className={styles.closeButton} onClick={() => router.back()} />
          <div className={styles.sidebar}>
            <div className={styles.topicGroup}>
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`${styles.topic} ${
                    topic.fromDb && currentTopic === topic.curr_topic
                      ? styles.selected
                      : ""
                  } `}
                  onClick={() => {
                    if (currentTopic !== topic.curr_topic) {
                      handleChangeTopic(topic.curr_topic);
                    }
                  }}
                >
                  {englishToHebrewTopics[topic.curr_topic]}
                </div>
              ))}
            </div>
          </div>

          <main className={styles.content}>
            {currentTopic && (
              <div className={styles.notesSection}>
                <div className={styles.sectionHeader}>
                  {englishToHebrewTopics[currentTopic]}
                </div>
                <div className={styles.notesContainer}>
                  {loadingNote ? (
                    <Loader className={`${styles.loadingNote} animate-spin`} />
                  ) : (
                    <textarea
                      className={styles.notesTextarea}
                      value={noteText}
                      onChange={handleNoteChange}
                      onInput={handleTextareaInput}
                      placeholder={notePlaceholder}
                      dir="rtl"
                    />
                  )}
                </div>
                <div className={styles.separator}></div>
                <div className={styles.additionalFieldsContainer}>
                  {currentTopic &&
                    topicFields[currentTopic as keyof typeof topicFields]?.map(
                      (
                        { label, field }: { label: string; field: string },
                        index: number
                      ) => {
                        const fieldKey = `${currentTopic}_field_${index + 1}`;

                        return (
                          <div key={field} className={styles.fieldContainer}>
                            <label className={styles.fieldLabel}>{label}</label>
                            <input
                              type="text"
                              className={styles.inputContainer}
                              value={additionalFields[fieldKey] || ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  `field_${index + 1}`,
                                  e.target.value
                                )
                              }
                              dir="rtl"
                            />
                          </div>
                        );
                      }
                    )}
                </div>
                <div className={styles.separator} />
                <div className={styles.stickersArea}>
                  {[0, 1, 2].map((index) => (
                    <img
                      key={index}
                      src={getStickerImage(currentTopic, index)}
                      alt={`Sticker ${index + 1}`}
                      className={styles.sticker}
                    />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </>
  );
}

const PersonalNotebookPage = () => {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <PersonalNotebookContent />
    </Suspense>
  );
};

export default PersonalNotebookPage;
