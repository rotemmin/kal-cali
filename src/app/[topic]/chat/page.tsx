"use client";

import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "./chat.css";
import pensionData from "@/lib/content/topics/pension.json";
import ScrollToTopButton from "./ScrollToTopButton";
import Modal from "@/components/general/Modal";

interface Message {
  from: string;
  text: string;
}

interface ChatMessageProps {
  from: string;
  text: string;
  isAdvisor: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ from, text, isAdvisor }) => (
  <div className={`chat-message ${isAdvisor ? "advisor" : "user"}`}>
    <div className={`message-bubble ${isAdvisor ? "advisor" : "user"}`}>
      <div className="message-sender">{from}</div>
      <div className="message-text">{text}</div>
    </div>
  </div>
);

const ChatInterface: React.FC = () => {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(true);
  const chatStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("User not found");
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

  const handleModalClose = () => {
    setShowModal(false);
    chatStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const chatMilestone = pensionData.milestones.find(
    (milestone) => milestone.help?.type === "chat"
  );

  const chatData = chatMilestone?.help || {
    type: "chat",
    content: [],
  };

  const mappedContent = chatData.content.map((message) => ({
    ...message,
    from: message.from === "אני" ? firstName || "אני" : message.from,
  }));

  return (
    <div className="chat-container">
      <Modal 
        isOpen={showModal} 
        onClose={handleModalClose}
        title="נצפה בשיחה לדוגמה"
      >
        <p>כי כשיודעים למה נכנסים הכל יותר קל!</p>
      </Modal>

      <div ref={chatStartRef}>
        <div className="chat-messages">
          {mappedContent.map((message, index) => (
            <ChatMessage
              key={index}
              from={message.from}
              text={message.text}
              isAdvisor={message.from === "יועץ"}
            />
          ))}
        </div>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default ChatInterface;