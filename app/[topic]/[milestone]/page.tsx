"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/NavigationButton";
import NoteComponent from "@/app/notes/singleNote";

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

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  const userGender: "male" | "female" = "female";

  return (
    <div>
      <h1>{currentMilestone.title}</h1>
      {currentMilestone.title2 && <h2>{currentMilestone.title2}</h2>}
      <p>{currentMilestone.description[userGender]}</p>
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
      <NoteComponent topicId={topic} />
    </div>
  );
};

export default MilestonePage;
