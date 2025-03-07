"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { debounce } from "lodash";
import styles from "./page.module.css";
import { Loader, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/src/components/Header";

const supabase = createClient();

const englishToHebrewTopics: { [key: string]: string } = {
  pension: "פנסיה",
  national_insurance: "ביטוח לאומי",
  bank_account: "חשבון בנק",
  income_tax: "מס הכנסה",
  pay_slips: "תלושי שכר",
  credit_card: "אשראי",
};

const topicFields = {
  pension: [
    { label: "שם החברה ושם היועץ", field: "company_advisor_name" },
    { label: "דמי הניהול מצבירה", field: "management_saving_pages" },
    { label: "תשלומים חודשיים", field: "monthly_payments" },
    { label: "פרטי קשר נוספים", field: "additional_contact_details" },
    { label: "תיאור כללי", field: "general_description" },
  ],
  national_insurance: [
    { label: "דמי הניהול מהפקדה", field: "management_deposit_pages" },
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
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");
  const [loadingNote, setLoadingNote] = useState<boolean>(false);
  const [additionalFields, setAdditionalFields] = useState<
    Record<string, string>
  >({});
  const [milestones, setMilestones] = useState<any>({});

  useEffect(() => {
    const topic = searchParams.get("topic");
    if (!currentTopic) {
      setCurrentTopic(topic);
    }
    // remove topic from search params in order to avoid maintaining it in the url
    window.history.replaceState(null, "", pathname);
  }, [searchParams]);

  useEffect(() => {
    const textarea = document.querySelector(
      `.${styles.notesTextarea}`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [noteText, currentTopic]);

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
        id: `db-${index}`,
        curr_topic: topic,
        fromDb: true,
      }));

      // Generate predefinedTopics with unique IDs
      const predefinedTopics: Topic[] = Object.keys(englishToHebrewTopics).map(
        (topic, index) => ({
          id: `predefined-${index}`,
          curr_topic: topic,
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
        setCurrentTopic("pension");
      } else if (data?.curr_topic && !currentTopic) {
        setCurrentTopic(data.curr_topic);
      }
    } catch (error) {
      setErrorMessage("לא הצלחנו לטעון את הנושאים");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [userId, currentTopic]);

  const fetchNotes = useCallback(async () => {
    if (!userId || !currentTopic) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("note, field_1, field_2, field_3, field_4, field_5")
        .eq("user_id", userId)
        .eq("curr_topic", currentTopic)
        .single();

      if (error) {
        setNoteText("");
        setAdditionalFields({});
        if (error.code !== "PGRST116") {
          // means no notes found
          throw error;
        }
      }

      if (data) {
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
  }, [userId, currentTopic]);

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
    console.log(topic);
    if (!topic) {
      console.error(`No English equivalent found for topic: ${topic}`);
      return "";
    }

    const topicMilestones = milestones[topic]?.milestones || {};
    const totalMilestones = Object.keys(topicMilestones).length;
    const completedMilestones = Object.values(topicMilestones).filter(
      (status) => status === 1
    ).length;

    const folderPath = `/${topic}_stickers/`;

    if (index === 0) {
      return completedMilestones > 0
        ? `${folderPath}${topic}1.svg`
        : `${folderPath}pre${topic}1.svg`;
    } else if (index === 1) {
      return completedMilestones >= totalMilestones / 2
        ? `${folderPath}${topic}2.svg`
        : `${folderPath}pre${topic}2.svg`;
    } else if (index === 2) {
      return completedMilestones === totalMilestones
        ? `${folderPath}${topic}3.svg`
        : `${folderPath}pre${topic}3.svg`;
    }

    return `${folderPath}pre${topic}1.svg`;
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

  const handleChangeTopic = (topic: string) => {
    setCurrentTopic(topic);
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNoteText(newNote);

    debouncedUpdateNote(userId, currentTopic!, newNote);
  };

  const handleFieldChange = (field: string, value: string) => {
    const fieldKey = `${currentTopic}_${field}`;

    setAdditionalFields((prev) => ({ ...prev, [fieldKey]: value }));
    debouncedUpdateField(userId, currentTopic!, field, value);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    textarea.style.height = "auto";

    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Inside PersonalNotebookPage component
  const [gender, setGender] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserGender = async () => {
      const { data: user, error } = await supabase.auth.getUser();

      if (error || !user?.user) return;

      const userId = user.user.id;
      const { data: userMetadata, error: metadataError } = await supabase
        .from("user_metadata")
        .select("sex")
        .eq("id", userId)
        .single();

      if (!metadataError && userMetadata) {
        setGender(userMetadata.sex);
      }
    };

    fetchUserGender();
  }, []);

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
                  } ${!topic.fromDb ? styles.nonClickable : ""}`}
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
};

export default PersonalNotebookPage;
