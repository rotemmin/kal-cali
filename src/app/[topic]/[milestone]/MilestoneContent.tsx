import React from 'react';
import { useRouter } from "next/navigation";
import ChatInterface from "../chat/page";
import MilestoneSticker from '@/components/milestoneSticker';
import MilestoneActions from './MilestoneActions'; 

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

interface MilestoneContentProps {
  currentMilestone: Milestone;
  userGender: "male" | "female";
  showChat: boolean;
  topic: string;
  normalizedTopic: string;
  completedMilestones: number;
  totalMilestones: number;
  processTextWithTerms: (text: string) => string;
  handleTermClick: (event: React.MouseEvent) => void;
  onChatFinish: () => void;
  onShowChat: () => void;
}

const MilestoneContent: React.FC<MilestoneContentProps> = ({
  currentMilestone,
  userGender,
  showChat,
  topic,
  normalizedTopic,
  completedMilestones,
  totalMilestones,
  processTextWithTerms,
  handleTermClick,
  onChatFinish,
  onShowChat
}) => {
  const router = useRouter();

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
        className="description-text description-container"
        onClick={handleTermClick}
        dangerouslySetInnerHTML={{
          __html: processTextWithTerms(description),
        }}
      />
    );
  };

  const handleAdditionalLinkClick = () => {
    if (currentMilestone?.additionalLink) {
      const finalLink = currentMilestone.additionalLink.replace(
        "[topic]",
        topic
      );
      router.push(finalLink);
    }
  };

  if (showChat) {
    return (
      <>
        <ChatInterface />
        {/* <MilestoneActions
          mainButtonText="סיימתי"
          onMainButtonClick={onChatFinish}
          topic={topic}
        /> */}
      </>
    );
  }

  const description = currentMilestone?.description?.[userGender];

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
          sticker={completedMilestones === totalMilestones - 1 ? 
            `/stickers/finalStickers/final_${normalizedTopic}.svg` : 
            currentMilestone.sticker}
          userGender={userGender}
        />
      )}

      {/* <MilestoneActions
        mainButtonText={currentMilestone?.help?.type === "chat" ? "הבא" : currentMilestone?.button}
        onMainButtonClick={currentMilestone?.help?.type === "chat" ? onShowChat : onChatFinish}
        topic={topic}
      /> */}
    </>
  );
};

export default MilestoneContent;