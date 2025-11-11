"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import Modal from "@/components/general/Modal";
import ScrollToTopButton from "@/app/[topic]/chat/ScrollToTopButton";
import "@/app/[topic]/chat/chat.css";

interface Message {
  from: string;
  text: string;
}

interface ChatMessagesProps {
  content: Message[];
  showIntroModal?: boolean;
  showScrollToTopButton?: boolean;
  introTitle?: string;
  introText?: string;
}

const ADVISOR_SENDERS = [
  "יועץ",
  "נציג",
  "נציגת"
];

interface ChatBubbleProps {
  from: string;
  text: string;
  isAdvisor: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ from, text, isAdvisor }) => (
  <div className={`chat-message ${isAdvisor ? "advisor" : "user"}`}>
    <div className={`message-bubble ${isAdvisor ? "advisor" : "user"}`}>
      <div className="message-sender">{from}</div>
      <div className="message-text">{text}</div>
    </div>
  </div>
);

const ChatMessages: React.FC<ChatMessagesProps> = ({
  content,
  showIntroModal = false,
  showScrollToTopButton = true,
  introTitle = "נצפה בשיחה לדוגמה",
  introText = "כי כשיודעים למה נכנסים הכל יותר קל!",
}) => {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(showIntroModal);
  const chatStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirstName(null);
        return;
      }

      try {
        const userMetadataRef = doc(db, "user_metadata", user.uid);
        const userMetadataDoc = await getDoc(userMetadataRef);

        if (userMetadataDoc.exists()) {
          setFirstName(userMetadataDoc.data()?.first_name || null);
        }
      } catch (error) {
        console.error("Error fetching user metadata:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    chatStartRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const mappedContent = useMemo(
    () =>
      content.map((message) => ({
        ...message,
        from: message.from === "אני" ? firstName || "אני" : message.from,
      })),
    [content, firstName]
  );

  if (!content.length) {
    return null;
    }

  return (
    <div className="chat-container">
      {showIntroModal && (
        <Modal isOpen={isModalOpen} onClose={handleModalClose} title={introTitle}>
          <p>{introText}</p>
        </Modal>
      )}

      <div ref={chatStartRef}>
        <div className="chat-messages">
          {mappedContent.map((message, index) => {
            const isAdvisor = ADVISOR_SENDERS.includes(message.from);
            return (
            <ChatBubble
              key={`${message.from}-${index}`}
              from={message.from}
              text={message.text}
              isAdvisor={isAdvisor}
            />
          )})}
        </div>
      </div>

      {showScrollToTopButton && <ScrollToTopButton />}
    </div>
  );
};

export default ChatMessages;

