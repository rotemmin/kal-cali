"use client";
import { db } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/general/NavigationButton";
import Modal from "@/components/general/modal";
import Header from "@/components/general/Header";
import "./MilestonePage.css";
import ProgressBar from "../milestones_progress_bar/ProgressBar";
import { X } from "lucide-react";
import ChatInterface from "../chat/page";
import MilestoneSticker from '@/components/milestoneSticker';

interface MilestoneDescription {
  text: string;
  type: "regular" | "indented";
}

interface Milestone {
  title: string;
  title2?: string;
  description: {
    male: MilestoneDescription[] | string;
    female: MilestoneDescription[] | string;
  };
  note?: {
    male: string;
    female: string;
  };
  help?: {
    type: string;
    content: { from: string; text: string }[];
  };
  button: string;
  additionalbutton?: string;
  additionalLink?: string;
  sticker?: string | {
    male: string;
    female: string;
  };
}

interface TopicData {
  milestones: Milestone[];
}

const MilestonePage: React.FC = () => {
  const auth = getAuth();
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };
  const normalizedTopic = topic.replace(/-/g, "_");
  const data: TopicData = require(`@/lib/content/topics/${normalizedTopic}.json`);

  const currentMilestone = data.milestones.find(
    (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
  );
  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [milestoneCompleted, setMilestoneCompleted] = useState(false);
  const [totalMilestones, setTotalMilestones] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(0);

  const [showChat, setShowChat] = useState(false);

  const [userGender, setUserGender] = useState<"male" | "female">("female");

  const handleChatFinish = async () => {
    await completeMilestone();
  };

  const fetchMilestoneProgress = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "user_activity", user.uid));
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const topicData = userData.topics_and_milestones?.[normalizedTopic];
      
      if (topicData && topicData.milestones) {
        const total = Object.keys(topicData.milestones).length;
        const completed = Object.values(topicData.milestones).filter(
          (val) => val === 1
        ).length;
        setTotalMilestones(total);
        setCompletedMilestones(completed);
      }
    } catch (error) {
      console.error("Error fetching milestone progress:", error);
    }
  };

  const updateCurrentTopic = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not found");
        return;
      }

      const userRef = doc(db, "user_activity", user.uid);
      await updateDoc(userRef, {
        curr_topic: normalizedTopic
      });
      
      console.log("Current topic updated successfully:", normalizedTopic);
    } catch (error) {
      console.error("Error updating current topic:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        updateCurrentTopic();
        fetchMilestoneProgress();
      }
    });

    return () => unsubscribe();
  }, [normalizedTopic]);

  useEffect(() => {
    import("@/lib/content/dictionary.json").then((dictionaryData) => {
      const dict: { [key: string]: string } = {};
      dictionaryData.dictionary.forEach(
        (entry: { title: string; description: string }) => {
          dict[entry.title] = entry.description;
        }
      );
      setDictionary(dict);
    });
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          setUserGender(userDoc.data().gender || "female");
        }
      });
    }
  }, [auth.currentUser]);

  const processTextWithTerms = (text: string): string => {
    if (typeof text !== "string") return "";
    return text.replace(
      /<span data-term='([^']+)'>[^<]+<\/span>/g,
      (match, term) => {
        const cleanTerm = term.replace(/^\u05e9?\u05d1/, "");
        return `<span class="term-highlight" data-term="${cleanTerm}">${
          match.match(/>([^<]+)</)?.[1] || cleanTerm
        }</span>`;
      }
    );
  };

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

  const renderDescription = (description: MilestoneDescription[] | string) => {
    if (Array.isArray(description)) {
      return (
        <div className="description-container">
          {description.map((item, index) => (
            <p
              key={index}
              className={`description-text ${
                item.type === "indented" ? "indented" : ""
              }`}
            >
              <span
                onClick={handleTermClick}
                dangerouslySetInnerHTML={{
                  __html: processTextWithTerms(item.text),
                }}
              />
            </p>
          ))}
        </div>
      );
    }

    return (
      <div
        className="description"
        onClick={handleTermClick}
        dangerouslySetInnerHTML={{
          __html: processTextWithTerms(description),
        }}
      />
    );
  };

  const renderContent = () => {
    if (showChat) {
      return (
        <>
          <ChatInterface />
          <div className="button-container">
            <button onClick={handleChatFinish} className="main-button">
              סיימתי
            </button>
          </div>
        </>
      );
    }

    const description = currentMilestone?.description?.[userGender];
    const handleAdditionalLinkClick = () => {
      if (currentMilestone?.additionalLink) {
        const finalLink = currentMilestone.additionalLink.replace(
          "[topic]",
          topic
        );
        router.push(finalLink);
      }
    };

    return (
      <>
        <h1 className="title">{currentMilestone?.title}</h1>
        {currentMilestone?.title2 && (
          <h2 className="subtitle">{currentMilestone.title2}</h2>
        )}

        {description && renderDescription(description)}

        {currentMilestone?.additionalbutton &&
          currentMilestone?.additionalLink && (
            <div className="text-center my-4">
              <button
                onClick={handleAdditionalLinkClick}
                className="secondary-button text-blue-600 hover:text-blue-800 underline text-sm"
              >
                {currentMilestone.additionalbutton}
              </button>
            </div>
          )}

        {currentMilestone?.note?.[userGender] && (
          <div className="note">
            <div
              dangerouslySetInnerHTML={{
                __html: currentMilestone.note[userGender].replace(
                  /\n/g,
                  "<br />"
                ),
              }}
            />
          </div>
        )}

        {currentMilestone?.sticker && (
          <MilestoneSticker 
            sticker={currentMilestone.sticker}
            userGender={userGender}
          />
        )}

        <div className="button-container">
          {currentMilestone?.help?.type === "chat" ? (
            <button onClick={() => setShowChat(true)} className="main-button">
              הבא
            </button>
          ) : (
            <button onClick={handleChatFinish} className="main-button">
              {currentMilestone?.button}
            </button>
          )}
        </div>
      </>
    );
  };

  const completeMilestone = async () => {
    if (milestoneCompleted) {
      console.log("Milestone already completed");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user found");
        alert("Please Login :)");
        return;
      }

      console.log("Starting milestone completion for user:", user.uid);
      const userRef = doc(db, "user_activity", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.error("User activity document not found");
        return;
      }

      const userData = userDoc.data();
      console.log("Current user data:", userData);
      const topicsAndMilestones = userData.topics_and_milestones || {};
      let currentBudget = userData.budget || 0;

      // Initialize the topic structure if it doesn't exist
      if (!(normalizedTopic in topicsAndMilestones)) {
        console.log("Creating new topic structure for:", normalizedTopic);
        topicsAndMilestones[normalizedTopic] = {
          status: 0,
          milestones: {}
        };
      }

      const topicObj = topicsAndMilestones[normalizedTopic];
      if (!topicObj.milestones) {
        console.log("Initializing milestones object");
        topicObj.milestones = {};
      }

      const milestoneKey = currentMilestone?.title.replace(/\s/g, "_");
      if (!milestoneKey) {
        console.error("No milestone key found");
        return;
      }

      console.log("Updating milestone:", milestoneKey);
      if (topicObj.milestones[milestoneKey] === 1) {
        console.log("Milestone already marked as complete");
        return;
      }

      topicObj.milestones[milestoneKey] = 1;

      const allComplete = Object.values(topicObj.milestones).every(
        (val) => val === 1
      );

      console.log("Updating database with new milestone status");
      await updateDoc(userRef, {
        topics_and_milestones: topicsAndMilestones,
        budget: currentBudget
      });

      setMilestoneCompleted(true);
      setCompletedMilestones((prev) => prev + 1);

      if (allComplete) {
        console.log("All milestones complete, updating topic status");
        topicObj.status = 1;
        currentBudget += 1;
        
        router.push(`/${topic}/finalPage`);
      } else {
        console.log("Navigating back");
        if (currentMilestone?.help?.type === "chat") {
          router.back();
        } else if (currentMilestone?.sticker) {
          setTimeout(() => {
            router.back();
          }, 1500);
        } else {
          router.back();
        }
      }
    } catch (error) {
      console.error("Error completing milestone:", error);
    }
  };

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  return (
    <>
      <Header />
      <div className="milestone-page">
        <div className="content-container">
          <X className="closeButtonMilestone" onClick={() => router.back()} />
          <ProgressBar
            totalMilestones={totalMilestones}
            completedMilestones={completedMilestones}
          />
          {renderContent()}
        </div>

        <Modal
          isOpen={!!selectedTerm}
          onClose={() => setSelectedTerm(null)}
          title={selectedTerm?.title || ""}
        >
          <p>{selectedTerm?.description}</p>
        </Modal>
      </div>

      <div className="nav-buttons">
        <NavigationButton
          icon="/icons/dictionary.svg"
          link="/dictionary"
          position="right"
          altText="Dictionary"
        />
        <NavigationButton
          icon="/icons/notebook.svg"
          link={`/personal_notebook?${topic ? `topic=${topic}` : ""}`}
          position="left"
          altText="Notebook"
        />
      </div>
    </>
  );
};

export default MilestonePage;