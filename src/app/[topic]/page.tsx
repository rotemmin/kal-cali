"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/general/NavigationButton";
import Modal from "@/components/general/Modal";
import Header from "@/components/general/Header";
import dictionaryData from "@/lib/content/dictionary.json";
import { X } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "@/lib/firebase";
import "./topic.css";

interface Milestone {
  title: string;
  link: string;
}

interface TopicData {
  title: string;
  description: {
    male: string;
    female: string;
  };
  milestones: Milestone[];
}

const saveDidSeeFinalPage = () => {
  localStorage.setItem("didSeeFinalPage", "true");
};

const didSeeFinalPage = () => {
  return localStorage.getItem("didSeeFinalPage") === "true";
};

const TopicPage = () => {
  const router = useRouter();
  const params = useParams();
  const { topic } = params as { topic: string };
  const normalizedTopic = topic.replace(/-/g, "_");
  
  const [data, setData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [nextMilestoneToComplete, setNextMilestoneToComplete] = useState<
    string | null
  >(null);

  const [userGender, setUserGender] = useState<"male" | "female">("female");
  const [milestonesStatus, setMilestonesStatus] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    async function fetchTopicData() {
      try {
        const topicData: TopicData = require(`@/lib/content/topics/${normalizedTopic}.json`);
        setData(topicData);
      } catch (err) {
        console.error("Error fetching topic data:", err);
        setError("Failed to load topic information");
      } finally {
        setLoading(false);
      }
    }
    
    fetchTopicData();
  }, [normalizedTopic]);

  // הגדרת המילון
  useEffect(() => {
    const dict: { [key: string]: string } = {};
    dictionaryData.dictionary.forEach((entry) => {
      dict[entry.title] = entry.description;
    });
    setDictionary(dict);
  }, []);

  // טעינת סטטוס אבני הדרך מ-Firebase
  useEffect(() => {
    const fetchMilestonesStatus = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        
        const userActivityRef = doc(db, "user_activity", user.uid);
        const docSnap = await getDoc(userActivityRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const milestones = userData?.topics_and_milestones?.[normalizedTopic]?.milestones;
          
          if (milestones) {
            setMilestonesStatus(milestones);
          } else {
            console.warn(`No milestones found for topic: ${normalizedTopic}`);
            setMilestonesStatus({});
          }
        } else {
          console.error("No user activity document found");
        }
      } catch (error) {
        console.error("Error fetching milestones status:", error);
      }
    };
    
    fetchMilestonesStatus();
  }, [normalizedTopic]);

  // בדיקת אבן הדרך הבאה להשלמה
  useEffect(() => {
    if (Object.keys(milestonesStatus).length === 0 || !data) return;
    
    // מעבר על המיילסטונים לפי הסדר שלהם ב-data
    for (const milestone of data.milestones) {
      const milestoneId = topicNameToTopicId(milestone.title);
      
      // אם המיילסטון הזה לא הושלם, זה המיילסטון הבא
      if (milestonesStatus[milestoneId] === 0) {
        setNextMilestoneToComplete(milestoneId);
        return;
      }
    }
    
    // אם כל המיילסטונים הושלמו
    if (!didSeeFinalPage()) {
      router.push(`/${topic}/finalPage`);
      saveDidSeeFinalPage();
    }
  }, [milestonesStatus, data, router, topic]);

  // טעינת מגדר המשתמש מ-Firebase
  useEffect(() => {
    const fetchGender = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          console.error("User not authenticated");
          return;
        }
        
        const userMetadataRef = doc(db, "user_metadata", user.uid);
        const docSnap = await getDoc(userMetadataRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.gender) {
            setUserGender(userData.gender === "male" ? "male" : "female");
          }
        }
      } catch (error) {
        console.error("Error fetching user gender:", error);
      }
    };
    
    fetchGender();
  }, []);

  // המרת שם אבן דרך למזהה (מחליף רווחים בקווים תחתונים)
  const topicNameToTopicId = (topicName: string) => {
    return topicName.replace(/\s+/g, "_");
  };

  // עיבוד הטקסט עם המונחים
  const processTextWithTerms = (text: string): string => {
    return text.replace(
      /<span data-term=['"]([^'"]+)['"]>([^<]+)<\/span>/g,
      (match, term, content) => {
        const cleanTerm = term.replace(/^ש?ב/, "");
        return `<span class="dictionary-term" data-term="${cleanTerm}">${content}</span>`;
      }
    );
  };

  // טיפול בלחיצה על מונח במילון
  const handleTermClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute("data-term")) {
      const term = target.getAttribute("data-term");
      if (term && dictionary[term]) {
        setSelectedTerm({
          title: term,
          description: dictionary[term],
        });
      }
    }
  };

  // מצבי טעינה ושגיאה
  if (loading) return <div className="loading-container">טוען נתונים...</div>;
  if (error) return <div className="error-container">שגיאה: {error}</div>;
  if (!data) return <div className="error-container">לא נמצאו נתונים עבור נושא זה</div>;

  return (
    <div className="topic-container">
      <Header />
      <X className="close-button" onClick={() => router.back()} />
      <div className="topic-page">
        <main className="topic-content">
          <h1 className="topic-title">{data.title}</h1>

          <div
            className="topic-description"
            onClick={handleTermClick}
            dangerouslySetInnerHTML={{
              __html: processTextWithTerms(
                data.description[userGender] || data.description.female
              ),
            }}
          />

          <div className="milestones-container">
            {data.milestones.map((milestone, index) => {
              const milestoneId = topicNameToTopicId(milestone.title);
              const isCompleted = milestonesStatus[milestoneId] === 1;
              const isNext = milestoneId === nextMilestoneToComplete;
              
              // בדיקה האם כל המיילסטונים הקודמים הושלמו
              const previousMilestonesCompleted = data.milestones
                .slice(0, index)
                .every(prevMilestone => milestonesStatus[topicNameToTopicId(prevMilestone.title)] === 1);
              
              return (
                <Link
                  key={index}
                  href={`/${topic}/${milestone.title}`}
                  style={{ textDecoration: "none" }}
                  onClick={(e) => {
                    // מניעת ניווט אם הכפתור לא זמין
                    if (!isCompleted && !isNext) {
                      e.preventDefault();
                    }
                  }}
                >
                  <button
                    className={`milestone-button ${
                      isCompleted || (isNext && previousMilestonesCompleted)
                        ? "completed"
                        : "incomplete"
                    }`}
                    disabled={!isCompleted && (!isNext || !previousMilestonesCompleted)}
                  >
                    <span className="milestone-text">{milestone.title}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </main>

        <div className="nav-buttons">
          <NavigationButton
            icon="/icons/dictionary.svg"
            link="/dictionary"
            position="right"
            altText="Dictionary"
          />
          <NavigationButton
            icon="/icons/notebook.svg"
            link={`/personal_notebook${topic ? `?topic=${topic}` : ""}`}
            position="left"
            altText="Notebook"
          />
        </div>

        <Modal
          isOpen={!!selectedTerm}
          onClose={() => setSelectedTerm(null)}
          title={selectedTerm?.title || ""}
        >
          <p>{selectedTerm?.description}</p>
        </Modal>
      </div>
    </div>
  );
};

export default TopicPage;