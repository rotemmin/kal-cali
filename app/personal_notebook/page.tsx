"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { debounce } from "lodash";
import styles from "./page.module.css";

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
    { label: "פטלול הפנסיה שנראה לך מתאים", field: "pension_fit" },
    { label: "סטטוס תשלומים", field: "payment_status" },
    { label: "מידע רלוונטי לניהול עתידי", field: "future_management_info" },
    { label: "סיכום השיחה", field: "call_summary" },
  ],
  bank_account: [
    { label: "עוד נקודות חשובות שעלו במהלך השיחה", field: "additional_points" },
    { label: "מספר החשבון", field: "account_number" },
    { label: "יתרה נוכחית", field: "current_balance" },
    { label: "פעולות אחרונות", field: "recent_transactions" },
    { label: "שינויים צפויים", field: "expected_changes" },
  ],
  income_tax: [
    { label: "נתוני מס הכנסה שנבדקו", field: "tax_data_checked" },
    { label: "הערות מיוחדות למס הכנסה", field: "income_tax_notes" },
    { label: "מסמכים שהוגשו", field: "submitted_documents" },
    { label: "מעקב אחר פניות", field: "followup_requests" },
    { label: "שאלות לא פתורות", field: "unresolved_questions" },
  ],
  pay_slips: [
    { label: "מספר תלושי השכר הנבדקים", field: "number_of_pay_slips" },
    { label: "פרטים חשובים מהתלושים", field: "important_pay_slip_details" },
    { label: "חריגות בתלושים", field: "pay_slip_anomalies" },
    { label: "תשלומים שהושוו", field: "compared_payments" },
    { label: "מידע שנוסף לתיקים", field: "information_added_to_records" },
  ],
  credit_card: [
    { label: "פרטי כרטיס אשראי", field: "credit_card_details" },
    { label: "הוצאות חודשיות נבדקות", field: "monthly_expenses_checked" },
    { label: "תשלומים עתידיים", field: "future_payments" },
    { label: "עסקאות חריגות", field: "unusual_transactions" },
    { label: "תאריך חידוש כרטיס", field: "card_renewal_date" },
  ],
};

interface Note {
  id: string;
  user_id: string;
  curr_topic: string;
  note: string;
  additional_fields?: string;
}

interface Topic {
  id: string;
  curr_topic: string;
  fromDb: boolean;
}

interface Question {
  id: string;
  question: string;
  answer: string;
}
type TopicKey = keyof typeof topicFields;

// const supabase = createClient();

const PersonalNotebookPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<TopicKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [additionalFields, setAdditionalFields] = useState<
    Record<string, string>
  >({});

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
      const dbTopics: Topic[] = Object.keys(topicsData).map((topic, index) => ({
        id: index.toString(),
        curr_topic: englishToHebrewTopics[topic] || topic,
        fromDb: true,
      }));

      const predefinedTopics: Topic[] = Object.keys(englishToHebrewTopics).map(
        (topic, index) => ({
          id: `predefined-${index}`,
          curr_topic: englishToHebrewTopics[topic],
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

      if (!currentTopic && data?.curr_topic) {
        setCurrentTopic(
          englishToHebrewTopics[data.curr_topic] || data.curr_topic
        );
      } else if (dbTopics.length > 0 && !currentTopic) {
        setCurrentTopic(dbTopics[0].curr_topic as TopicKey);
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
        const newFields: Record<string, string> = {};
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith("field_") && value) {
            newFields[`${topicInEnglish}_${key}`] = value;
          }
        });
        setAdditionalFields((prev) => ({
          ...prev,
          ...newFields,
        }));
      } else {
        // Clear the fields when no data is found for this topic
        setNoteText("");
        const fieldsToRemove = Object.keys(additionalFields).filter((key) =>
          key.startsWith(`${topicInEnglish}_`)
        );
        const newFields = { ...additionalFields };
        fieldsToRemove.forEach((key) => delete newFields[key]);
        setAdditionalFields(newFields);
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את ההערות");
      console.error(error);
    }
  }, [userId, currentTopic]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes, currentTopic]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        console.log("No user session found.");
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleFieldChange = (field: string, value: string) => {
    const topicInEnglish = hebrewToEnglishTopics[currentTopic!];
    if (!topicInEnglish) return;

    const fieldKey = `${topicInEnglish}_${field}`;
    setAdditionalFields((prev) => ({ ...prev, [fieldKey]: value }));

    const updateDb = debounce(async () => {
      try {
        if (!userId || !currentTopic) return;

        const fieldData = {
          user_id: userId,
          curr_topic: topicInEnglish,
          [field]: value,
        };

        const { error } = await supabase
          .from("notes")
          .upsert(fieldData, { onConflict: "user_id, curr_topic" });

        if (error) throw error;
      } catch (error) {
        console.error("Failed to save field:", error);
      }
    }, 500);

    updateDb();
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNoteText(newNote);

    const updateDb = debounce(async (newNote: string) => {
      try {
        if (!userId || !currentTopic) return;

        const topicInEnglish = hebrewToEnglishTopics[currentTopic!];
        if (!topicInEnglish) return;

        await supabase.from("notes").upsert(
          {
            user_id: userId,
            curr_topic: topicInEnglish,
            note: newNote,
          },
          { onConflict: "user_id, curr_topic" }
        );
      } catch (error) {
        setErrorMessage("Failed to save note.");
        console.error(error);
      }
    }, 500);

    updateDb(newNote);
  };

  return (
    <div className={styles.notebookContainer}>
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
              onClick={() =>
                topic.fromDb && setCurrentTopic(topic.curr_topic as TopicKey)
              }
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
                placeholder="רשמי כאן את ההערות שלך..."
                dir="rtl"
              />
            </div>
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
                    const topicInEnglish = hebrewToEnglishTopics[currentTopic];
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
          </div>
        )}
      </main>
    </div>
  );
};

export default PersonalNotebookPage;
