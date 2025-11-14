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

const topicOrder: string[] = [
  "national_insurance", 
  "tax",                
  "pension",            
  "insurance",          
  "salary",             
  "credit_card",        
];

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

type StickerStage =
  | {
      id: string;
      type: "milestone";
      completedPath: string;
      pendingPath: string;
    }
  | {
      id: "__final__";
      type: "final";
      completedPath: string;
      pendingPath: string;
    };

const topicDataMap = {
  pension: pensionData,
  national_insurance: nationalInsuranceData,
  credit_card: creditCardData,
  salary: salaryData,
  insurance: insuranceData,
  tax: taxData,
};

type TopicKey = keyof typeof topicDataMap;

const isTopicKey = (value: string): value is TopicKey =>
  Object.prototype.hasOwnProperty.call(topicDataMap, value);

const milestoneOrders: { [topic: string]: string[] } = {};
Object.entries(topicDataMap).forEach(([topic, data]) => {
  milestoneOrders[topic] = data.milestones.map((m: any) => m.title.replace(/\s+/g, "_"));
});

const normalizeMilestoneKey = (title: string) => title.replace(/\s+/g, "_");

const resolveCompletedStickerPath = (sticker: string | { male: string; female: string }, gender: string): string => {
  if (!sticker) return "";
  if (typeof sticker === "string") {
    return sticker;
  }
  if (gender === "male" && sticker.male) return sticker.male;
  if (gender === "female" && sticker.female) return sticker.female;
  return sticker.male || sticker.female || "";
};

const derivePendingStickerPath = (completedPath: string): string => {
  if (!completedPath) return "";

  if (completedPath.includes("/littleStickersTitle/")) {
    const filename = completedPath.split("/").pop() || "";
    const match = filename.match(/title_(.+)\.svg/i);
    const base = match?.[1];
    if (base) {
      return `/stickers/littleStickersTitle/pre_title_${base}.svg`;
    }
  }

  if (completedPath.includes("/littleStickersDrawing/")) {
    const filename = completedPath.split("/").pop() || "";
    const match = filename.match(/drawing_(.+)\.svg/i);
    const base = match?.[1];
    if (base) {
      return `/stickers/littleStickersDrawing/pre_drawing_${base}.svg`;
    }
  }

  if (completedPath.includes("/finalStickers/")) {
    const filename = completedPath.split("/").pop() || "";
    const match = filename.match(/final_(.+)\.svg/i);
    const base = match?.[1];
    if (base) {
      return `/stickers/finalStickersEmpty/empty_${base}.svg`;
    }
  }

  return completedPath;
};

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
    if (topic) {
      if (topic !== currentTopic) {
        setCurrentTopic(topic);
      }
    }
    window.history.replaceState(null, "", pathname);
  }, [searchParams, currentTopic, pathname]);

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

        const sortedTopics = mergedTopics.sort((a, b) => {
          const indexA = topicOrder.indexOf(a.curr_topic);
          const indexB = topicOrder.indexOf(b.curr_topic);
          
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          
          return indexA - indexB;
        });

        setTopics(sortedTopics);
        
        // עדכון currentTopic רק אם אין query parameter
        const topicFromQuery = searchParams.get("topic");
        if (!topicFromQuery) {
          if (!currentTopic || currentTopic === "O") {
            setCurrentTopic("pension");
          } else if (data?.curr_topic && !currentTopic) {
            setCurrentTopic(data.curr_topic);
          }
        }
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את הנושאים");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, currentTopic, searchParams]);

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

  const stickerStages = useMemo((): StickerStage[] => {
    if (!currentTopic || !isTopicKey(currentTopic)) return [];

    const topicKey: TopicKey = currentTopic;
    const topicData = topicDataMap[topicKey];
    if (!topicData?.milestones) return [];

    const effectiveGender = gender === "male" ? "male" : "female";

    const milestoneStages = (topicData.milestones as any[])
      .map((milestone: any): StickerStage | null => {
        if (!milestone?.sticker) return null;

        const milestoneKey = normalizeMilestoneKey(milestone.title);
        const completedPath = resolveCompletedStickerPath(milestone.sticker, effectiveGender);
        if (!completedPath) return null;

        return {
          id: milestoneKey,
          type: "milestone" as const,
          completedPath,
          pendingPath: derivePendingStickerPath(completedPath),
        };
      })
      .filter((stage): stage is StickerStage => Boolean(stage));

    const finalStage: StickerStage = {
      id: "__final__",
      type: "final" as const,
      completedPath: `/stickers/finalStickers/final_${topicKey}.svg`,
      pendingPath: `/stickers/finalStickersEmpty/empty_${topicKey}.svg`,
    };

    return [...milestoneStages, finalStage];
  }, [currentTopic, gender]);

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

  const topicMilestonesStatus = useMemo(() => {
    if (!currentTopic || !isTopicKey(currentTopic)) return {} as Record<string, number>;
    return milestones[currentTopic]?.milestones || {};
  }, [currentTopic, milestones]);

  const isAllMilestonesDone = useMemo(() => {
    if (!currentTopic || !isTopicKey(currentTopic)) return false;
    const milestoneOrder = milestoneOrders[currentTopic] || [];
    if (milestoneOrder.length === 0) return false;
    return milestoneOrder.every((key) => topicMilestonesStatus[key] === 1);
  }, [currentTopic, topicMilestonesStatus]);

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
                  {stickerStages.map((stage, index) => {
                    const isStageCompleted =
                      stage.type === "final"
                        ? isAllMilestonesDone
                        : topicMilestonesStatus[stage.id] === 1;
                    const imageSrc = isStageCompleted ? stage.completedPath : stage.pendingPath;

                    if (!imageSrc) {
                      return null;
                    }

                    // קביעת המיקום והגודל לפי index
                    let stickerClass = styles.sticker;
                    if (index === 2) {
                      // sticker 3 - הגדולה, מצד ימין
                      stickerClass = `${styles.sticker} ${styles.stickerLarge}`;
                    } else if (index === 0) {
                      // sticker 1 - משמאל, תחתונה
                      stickerClass = `${styles.sticker} ${styles.stickerSmall1}`;
                    } else if (index === 1) {
                      // sticker 2 - משמאל, עליונה
                      stickerClass = `${styles.sticker} ${styles.stickerSmall2}`;
                    }

                    return (
                      <img
                        key={`${stage.id}-${index}`}
                        src={imageSrc}
                        alt={`Sticker ${index + 1}`}
                        className={stickerClass}
                      />
                    );
                  })}
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
