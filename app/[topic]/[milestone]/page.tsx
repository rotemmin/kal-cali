"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/NavigationButton";
import NoteComponent from "@/app/notes/singleNote";
import Modal from "@/components/modal";

interface Milestone {
  title: string;
  title2?: string;
  description: {
    male: string;
    female: string;
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
  additionalbutton?: string; // כפתור נוסף
  additionalLink?: string; // קישור נוסף
}

interface TopicData {
  milestones: Milestone[];
}

const MilestonePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };

  const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
  const currentMilestone = data.milestones.find(
    (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
  );

  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    import('@/public/dictionary.json').then((dictionaryData) => {
      const dict: { [key: string]: string } = {};
      dictionaryData.dictionary.forEach((entry: { title: string; description: string }) => {
        dict[entry.title] = entry.description;
      });
      setDictionary(dict);
    });
  }, []);

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  const userGender: "male" | "female" = "female";

  const processTextWithTerms = (text: string): string => {
    return text.replace(/<span data-term='([^']+)'>[^<]+<\/span>/g, (match, term) => {
      const cleanTerm = term.replace(/^ש?ב/, '');
      return `<span style="color: purple; cursor: pointer;" data-term="${cleanTerm}">${match.match(/>([^<]+)</)?.[1] || cleanTerm}</span>`;
    });
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

  return (
    <div>
      <h1>{currentMilestone.title}</h1>
      {currentMilestone.title2 && <h2>{currentMilestone.title2}</h2>}
      <div 
        onClick={handleTermClick} 
        dangerouslySetInnerHTML={{ __html: processTextWithTerms(currentMilestone.description[userGender]) }}
      />
      {currentMilestone.note && <p>{currentMilestone.note[userGender]}</p>}
      {currentMilestone.help && (
        <div>
          {currentMilestone.help.type === "chat" && (
            <div>
              {currentMilestone.help.content.map((chat, index) => (
                <p key={index}>
                  <strong>{chat.from}:</strong> {chat.text}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
      {/* כפתור למידע נוסף */}
      {currentMilestone.additionalLink && currentMilestone.additionalbutton && (
        <button onClick={() => router.push(currentMilestone.additionalLink!)}>
          {currentMilestone.additionalbutton}
        </button>
      )}
      {/* כפתור סיימתי */}
      <button onClick={() => window.history.back()}>
        {currentMilestone.button}
      </button>
      <NavigationButton label="מילון" link="/dictionary" position="right" />
      <NavigationButton label="תפריט" link="/burger_menu" position="left" />
      <Modal
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        title={selectedTerm?.title || ""}>
        <p>{selectedTerm?.description}</p>
      </Modal>
      <NoteComponent />{" "}
    </div>
  );
};

export default MilestonePage;
