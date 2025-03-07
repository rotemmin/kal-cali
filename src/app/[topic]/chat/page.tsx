"use client";

import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import "./chat.css";
import pensionData from "@/lib/content/topics/pension.json";
import ScrollToTopButton from "./ScrollToTopButton";
import Modal from "@/src/components/modal";

interface Message {
  from: string;
  text: string;
}

interface ChatMessageProps {
  from: string;
  text: string;
  isAdvisor: boolean;
}

const supabase = createClient();

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
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("User session not found");
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from("user_metadata")
          .select("first_name")
          .eq("id", session.user.id)
          .single();

        if (userError) {
          console.error("Error fetching user metadata:", userError);
        } else {
          setFirstName(userData?.first_name || null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
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