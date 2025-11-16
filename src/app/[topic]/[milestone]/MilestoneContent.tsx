import React from 'react';
import { useRouter } from "next/navigation";
import MilestoneSticker from '@/components/milestoneSticker';
import ChatMessages from "@/components/chat/ChatMessages";

interface MilestoneDescription {
  text: string;
  type: "regular" | "indented";
}

interface Milestone {
  title: string;
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
  topic: string;
  normalizedTopic: string;
  processTextWithTerms: (text: string) => string;
  handleTermClick: (event: React.MouseEvent) => void;
  isStickerRevealing: boolean;
  isMilestoneCompleted: boolean;
}

const MilestoneContent: React.FC<MilestoneContentProps> = ({
  currentMilestone,
  userGender,
  topic,
  normalizedTopic,
  processTextWithTerms,
  handleTermClick,
  isStickerRevealing,
  isMilestoneCompleted,
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

  const description = currentMilestone?.description?.[userGender];

  return (
    <>
      <h1 className="title">{currentMilestone?.title}</h1>

      {description && renderDescription(description)}

      {currentMilestone?.help?.type === "chat" && Array.isArray(currentMilestone.help.content) && (
        <div className="help-section">
          <ChatMessages
            content={currentMilestone.help.content}
            showScrollToTopButton={false}
          />
        </div>
      )}

      {/* {currentMilestone?.additionalbutton &&
        currentMilestone?.additionalLink && (
          <div className="text-center my-4">
            <button
              onClick={handleAdditionalLinkClick}
              className="secondary-button text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {currentMilestone.additionalbutton}
            </button>
          </div>
        )} */}
                {/*"additionalbutton": "למידע נוסף על מסלולי ההשקעה",*/
                /*"additionalLink": "/[topic]/investment_options",*/}

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
          shouldReveal={isStickerRevealing}
          forceShowSource={isMilestoneCompleted && !isStickerRevealing}
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