"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import NavigationButton from "@/components/NavigationButton";
import NoteComponent from "@/app/notes/singleNote";
import Modal from "@/components/modal";
import "./MilestonePage.css";

interface MilestoneDescription {
  text: string;
  type: 'regular' | 'indented';
}

interface Milestone {
  title: string;
  description: {
    male: MilestoneDescription[] | string;
    female: MilestoneDescription[] | string;
  };
  button: string;
<<<<<<< HEAD
=======
  additionalbutton?: string;
  additionalLink?: string;
>>>>>>> 2cd28dc3f037bcd32b256bfe57fd9c5e0e2506a1
}

interface TopicData {
  milestones: Milestone[];
}

const MilestonePage: React.FC = () => {
  const supabase = createClientComponentClient();
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };

  const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
  const currentMilestone = data.milestones.find(
    (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
  );

  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{
    title: string;
    description: string;
  } | null>(null);

  useEffect(() => {
    import("@/public/dictionary.json").then((dictionaryData) => {
      const dict: { [key: string]: string } = {};
      dictionaryData.dictionary.forEach(
        (entry: { title: string; description: string }) => {
          dict[entry.title] = entry.description;
        }
      );
      setDictionary(dict);
    });
  }, []);

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  const userGender: "male" | "female" = "female";

  const processTextWithTerms = (text: string): string => {
<<<<<<< HEAD
    return text.replace(
      /<span data-term='([^']+)'>[^<]+<\/span>/g,
      (match, term) => {
        const cleanTerm = term.replace(/^ש?ב/, "");
        return `<span style="color: purple; cursor: pointer;" data-term="${cleanTerm}">${
          match.match(/>([^<]+)</)?.[1] || cleanTerm
        }</span>`;
      }
    );
=======
    return text.replace(/<span data-term='([^']+)'>[^<]+<\/span>/g, (match, term) => {
      const cleanTerm = term.replace(/^ש?ב/, '');
      return `<span class="term-highlight" data-term="${cleanTerm}">${match.match(/>([^<]+)</)?.[1] || cleanTerm}</span>`;
    });
>>>>>>> 2cd28dc3f037bcd32b256bfe57fd9c5e0e2506a1
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

<<<<<<< HEAD
  // ########################################
  // Function to complete the milestone and send a POST request
  const completeMilestone = async () => {
    try {
      // Fetch the current user's session to get the user ID
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        alert("User not logged in!");
        return;
      }

      const userId = session.user.id; // Retrieve the logged-in user's ID

      const response = await fetch("/api/milestoneCompletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // Pass the logged-in user's ID
          topic, // The current topic
          milestone, // The current milestone
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Milestone completed successfully!");
        // Optionally refresh or update state
        router.push(`/${topic}`);
      } else {
        alert("Error completing milestone: " + result.message);
      }
    } catch (err) {
      console.error("Error completing milestone:", err);
      alert("An unexpected error occurred while completing the milestone.");
    }
  };
  // ########################################

  return (
    <div>
      <h1>{currentMilestone.title}</h1>
      <div
        onClick={handleTermClick}
        dangerouslySetInnerHTML={{
          __html: processTextWithTerms(
            currentMilestone.description[userGender]
          ),
        }}
      />
      <button onClick={completeMilestone}>{currentMilestone.button}</button>
      <NavigationButton label="מילון" link="/dictionary" position="right" />
      <NavigationButton label="תפריט" link="/burger_menu" position="left" />
=======
  const renderDescription = (description: MilestoneDescription[] | string) => {
    if (Array.isArray(description)) {
      return (
        <div className="description-container">
          {description.map((item, index) => (
            <p 
              key={index} 
              className={`description-text ${item.type === 'indented' ? 'indented' : ''}`}
            >
              <div 
                onClick={handleTermClick}
                dangerouslySetInnerHTML={{ 
                  __html: processTextWithTerms(item.text) 
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
          __html: processTextWithTerms(description) 
        }}
      />
    );
  };

  return (
    <div className="milestone-page">
      <div className="content-container">
        <h1 className="title">{currentMilestone.title}</h1>
        {currentMilestone.title2 && <h2 className="subtitle">{currentMilestone.title2}</h2>}
        
        {renderDescription(currentMilestone.description[userGender])}
        
        {currentMilestone.note && (
          <p className="note">{currentMilestone.note[userGender]}</p>
        )}
        
        {currentMilestone.help && (
          <div className="help-section">
            {currentMilestone.help.type === "chat" && (
              <div className="chat-container">
                {currentMilestone.help.content.map((chat, index) => (
                  <p key={index} className="chat-message">
                    <strong>{chat.from}:</strong> {chat.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="button-container">
          {currentMilestone.additionalLink && currentMilestone.additionalbutton && (
            <button 
              onClick={() => router.push(currentMilestone.additionalLink!)} 
              className="additional-button"
            >
              {currentMilestone.additionalbutton}
            </button>
          )}
          
          <button 
            onClick={() => window.history.back()}
            className="main-button"
          >
            {currentMilestone.button}
          </button>
        </div>
      </div>

      <div className="navigation-buttons">
        <NavigationButton label="מילון" link="/dictionary" position="right" />
        <NavigationButton label="תפריט" link="/burger_menu" position="left" />
      </div>

>>>>>>> 2cd28dc3f037bcd32b256bfe57fd9c5e0e2506a1
      <Modal
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        title={selectedTerm?.title || ""}
      >
        <p>{selectedTerm?.description}</p>
      </Modal>
<<<<<<< HEAD
=======

>>>>>>> 2cd28dc3f037bcd32b256bfe57fd9c5e0e2506a1
      <NoteComponent topicId={topic} />
    </div>
  );
};

export default MilestonePage;