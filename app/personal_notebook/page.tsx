"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { debounce } from "lodash";
import styles from "./page.module.css";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/lib/components/Header";

const englishToHebrewTopics: { [key: string]: string } = {
  pension: "פנסיה",
  national_insurance: "ביטוח לאומי",
  bank_account: "חשבון בנק",
  income_tax: "מס הכנסה",
  pay_slips: "תלושי שכר",
  credit_card: "אשראי",
};

const hebrewToEnglishTopics: { [key: string]: string } = {
  פנסיה: "pension",
  "ביטוח לאומי": "national_insurance",
  "חשבון בנק": "bank_account",
  "מס הכנסה": "income_tax",
  "תלושי שכר": "pay_slips",
  אשראי: "credit_card",
};

const topicFields = {
  pension: [
    { label: "שם החברה ושם היועץ", field: "company_advisor_name" },
    { label: "דפי הניהול מצבירה", field: "management_saving_pages" },
    { label: "תשלומים חודשיים", field: "monthly_payments" },
    { label: "פרטי קשר נוספים", field: "additional_contact_details" },
    { label: "תיאור כללי", field: "general_description" },
  ],
  national_insurance: [
    { label: "דפי הניהול מהפקדה", field: "management_deposit_pages" },
    { label: "מסלול הפנסיה שנראה לי מתאים", field: "pension_fit" },
    { label: "סטטוס תשלומים", field: "payment_status" },
    { label: "מידע רלוונטי לניהול עתידי", field: "future_management_info" },
    { label: "סיכום השיחה", field: "call_summary" },
  ],
  bank_account: [
    { label: "עוד נקודות חשובות שעלו במהלך השיחה", field: "additional_points" },
    { label: "סוג חשבון", field: "account_type" },
    { label: "דמי ניהול", field: "management_fee" },
    { label: "פעולות אחרונות", field: "recent_transactions" },
    { label: "שינויים צפויים", field: "expected_changes" },
  ],
};

interface Topic {
  id: string;
  curr_topic: string;
  fromDb: boolean;
}

const PersonalNotebookPage = () => {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [additionalFields, setAdditionalFields] = useState<
    Record<string, string>
  >({});
  const [milestones, setMilestones] = useState<any>({});

  const fetchTopics = useCallback(async () => {
    try {
      if (!userId) {
        console.error("User ID is null. Cannot fetch user activity.");
        return;
      }

      const { data, error } = await supabase
        .from("user_activity")
        .select("topics_and_milestones, curr_topic")
        .eq("id", userId)
        .single();

      if (error) throw error;

      const topicsData = data?.topics_and_milestones || {};
      setMilestones(topicsData);

      // Generate dbTopics with unique IDs
      const dbTopics: Topic[] = Object.keys(topicsData).map((topic, index) => ({
        id: `db-${index}`, // Generate unique ID for each db topic
        curr_topic: englishToHebrewTopics[topic] || topic,
        fromDb: true,
      }));

      // Generate predefinedTopics with unique IDs
      const predefinedTopics: Topic[] = Object.keys(englishToHebrewTopics).map(
        (topic, index) => ({
          id: `predefined-${index}`, // Generate unique ID for each predefined topic
          curr_topic: englishToHebrewTopics[topic],
          fromDb: false,
        })
      );

      // Merge dbTopics and predefinedTopics, ensuring no duplicates
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
        console.log("Setting current topic to pension");
        setCurrentTopic("פנסיה");
      } else if (data?.curr_topic && !currentTopic) {
        setCurrentTopic(
          englishToHebrewTopics[data.curr_topic] || data.curr_topic
        );
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את הנושאים");
      console.error(error);
    }
  }, [userId, currentTopic]);

  const fetchNotes = useCallback(async () => {
    if (!userId || !currentTopic) return;

    try {
      const topicInEnglish = hebrewToEnglishTopics[currentTopic];
      if (!topicInEnglish) return;

      const { data, error } = await supabase
        .from("notes")
        .select("note, field_1, field_2, field_3, field_4, field_5")
        .eq("user_id", userId)
        .eq("curr_topic", topicInEnglish)
        .single();

      if (error) throw error;

      if (data) {
        setNoteText(data.note || "");

        const newFields = Object.entries(data)
          .filter(([key]) => key.startsWith("field_"))
          .reduce((acc, [key, value]) => {
            acc[`${topicInEnglish}_${key}`] = value as string;
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
              ([key]) => !key.startsWith(`${topicInEnglish}_`)
            )
          )
        );
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את ההערות");
      console.error("Error fetching notes:", error);
    }
  }, [userId, currentTopic]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    if (currentTopic) {
      fetchNotes();
    }
  }, [fetchNotes, currentTopic]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId((prevUserId) => {
          if (prevUserId !== session.user.id) {
            return session.user.id;
          }
          return prevUserId;
        });
      } else {
        console.log("No user session found.");
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const getStickerImage = (topic: string, index: number) => {
    const topicInEnglish = hebrewToEnglishTopics[topic];
    console.log(topicInEnglish);
    if (!topicInEnglish) {
      console.error(`No English equivalent found for topic: ${topic}`);
      return ""; // Return an empty string or a default image path if needed
    }

    const topicMilestones = milestones[topicInEnglish]?.milestones || {};
    const totalMilestones = Object.keys(topicMilestones).length;
    const completedMilestones = Object.values(topicMilestones).filter(
      (status) => status === 1
    ).length;

    const folderPath = `/${topicInEnglish}_stickers/`;

    if (index === 0) {
      return completedMilestones > 0
        ? `${folderPath}${topicInEnglish}1.svg`
        : `${folderPath}pre${topicInEnglish}1.svg`;
    } else if (index === 1) {
      return completedMilestones >= totalMilestones / 2
        ? `${folderPath}${topicInEnglish}2.svg`
        : `${folderPath}pre${topicInEnglish}2.svg`;
    } else if (index === 2) {
      return completedMilestones === totalMilestones
        ? `${folderPath}${topicInEnglish}3.svg`
        : `${folderPath}pre${topicInEnglish}3.svg`;
    }

    return `${folderPath}pre${topicInEnglish}1.svg`;
  };

  const debouncedUpdateNote = useMemo(
    () =>
      debounce(async (userId, topicInEnglish, newNote) => {
        try {
          if (!userId || !topicInEnglish) return;
          await supabase.from("notes").upsert(
            {
              user_id: userId,
              curr_topic: topicInEnglish,
              note: newNote,
            },
            { onConflict: "user_id, curr_topic" }
          );
        } catch (error) {
          console.error("Failed to save note:", error);
        }
      }, 500),
    []
  );

  const debouncedUpdateField = useMemo(
    () =>
      debounce(async (userId, topicInEnglish, field, value) => {
        try {
          if (!userId || !topicInEnglish) return;
          await supabase.from("notes").upsert(
            {
              user_id: userId,
              curr_topic: topicInEnglish,
              [field]: value,
            },
            { onConflict: "user_id, curr_topic" }
          );
        } catch (error) {
          console.error("Failed to save field:", error);
        }
      }, 500),
    []
  );

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNoteText(newNote);

    const topicInEnglish = hebrewToEnglishTopics[currentTopic!];
    debouncedUpdateNote(userId, topicInEnglish, newNote);
  };

  const handleFieldChange = (field: string, value: string) => {
    const topicInEnglish = hebrewToEnglishTopics[currentTopic!];
    if (!topicInEnglish) return;

    const fieldKey = `${topicInEnglish}_${field}`;
    setAdditionalFields((prev) => ({ ...prev, [fieldKey]: value }));
    debouncedUpdateField(userId, topicInEnglish, field, value);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    const textarea = document.querySelector(
      `.${styles.notesTextarea}`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [noteText, currentTopic]);

  return (
    <>
      <Header />
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
                } ${!topic.fromDb ? styles.nonClickable : ""}`}
                onClick={() => {
                  if (currentTopic !== topic.curr_topic) {
                    setCurrentTopic(topic.curr_topic);
                  }
                }}
              >
                {topic.curr_topic}
              </div>
            ))}
          </div>
        </div>

        <main className={styles.content}>
          {currentTopic && (
            <div className={styles.notesSection}>
              <div className={styles.sectionHeader}>{currentTopic}</div>
              <div className={styles.notesContainer}>
                <textarea
                  className={styles.notesTextarea}
                  value={noteText}
                  onChange={handleNoteChange}
                  onInput={handleTextareaInput}
                  placeholder="רשמי כאן את ההערות שלך..."
                  dir="rtl"
                />
              </div>
              <div className={styles.separator}></div>
              <div className={styles.additionalFieldsContainer}>
                {currentTopic &&
                  topicFields[
                    hebrewToEnglishTopics[
                      currentTopic
                    ] as keyof typeof topicFields
                  ]?.map(
                    (
                      { label, field }: { label: string; field: string },
                      index: number
                    ) => {
                      const topicInEnglish =
                        hebrewToEnglishTopics[currentTopic];
                      const fieldKey = `${topicInEnglish}_field_${index + 1}`;

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
              <div className={styles.separator}></div>
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
    </>
  );
};

export default PersonalNotebookPage;
