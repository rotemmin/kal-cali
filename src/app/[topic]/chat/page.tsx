"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import ChatMessages from "@/components/chat/ChatMessages";
import "./chat.css";

const ChatPage: React.FC = () => {
  const params = useParams();
  const { topic } = params as { topic: string };
  const normalizedTopic = topic.replace(/-/g, "_");

  const chatContent = useMemo(() => {
    try {
      const topicData = require(`@/lib/content/topics/${normalizedTopic}.json`);
      const chatMilestone = topicData.milestones?.find(
        (milestone: any) => milestone?.help?.type === "chat"
      );

      return chatMilestone?.help?.content ?? [];
    } catch (error) {
      console.error("Failed to load chat data for topic:", normalizedTopic, error);
      return [];
    }
  }, [normalizedTopic]);

  return <ChatMessages content={chatContent} />;
};

export default ChatPage;