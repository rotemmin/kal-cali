"use client";
import React, { useState, useCallback, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/general/NavigationButton";
import Modal from "@/components/general/Modal.jsx";
import Header from "@/components/general/Header";
import "./MilestonePage.css";
import ProgressBar from "../milestones_progress_bar/ProgressBar";
import { X } from "lucide-react";
import MilestoneContent from "./MilestoneContent";
import { useMilestone } from "@/hooks/useMilestone";
import { useDictionary } from "@/hooks/useDictionary";

// Memoized components for better performance
const MemoizedMilestoneContent = memo(MilestoneContent);
const MemoizedProgressBar = memo(ProgressBar);
const MemoizedModal = memo(Modal);

const MilestonePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };
  const normalizedTopic = topic.replace(/-/g, "_");

  // Custom hooks
  const {
    currentMilestone,
    milestoneCompleted,
    totalMilestones,
    completedMilestones,
    userGender,
    completeMilestone,
    loading
  } = useMilestone(topic, milestone, normalizedTopic);

  const {
    selectedTerm,
    processTextWithTerms,
    handleTermClick,
    closeTermModal
  } = useDictionary();

  // Local state
  const [showChat, setShowChat] = useState(false);

  // Memoized handlers
  const handleChatFinish = useCallback(async () => {
    await completeMilestone();
  }, [completeMilestone]);

  const handleShowChat = useCallback(() => {
    setShowChat(true);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="milestone-page">
          <div className="content-container">
            <div className="loading">טוען...</div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (!currentMilestone) {
    return (
      <>
        <Header />
        <div className="milestone-page">
          <div className="content-container">
            <div>המיילסטון לא נמצא!</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="milestone-page">
        <div className="content-container">
          <X className="closeButtonMilestone" onClick={handleBack} />
          
          <MemoizedProgressBar
            totalMilestones={totalMilestones}
            completedMilestones={completedMilestones}
          />
          
          <MemoizedMilestoneContent
            currentMilestone={currentMilestone}
            userGender={userGender}
            showChat={showChat}
            topic={topic}
            normalizedTopic={normalizedTopic}
            completedMilestones={completedMilestones}
            totalMilestones={totalMilestones}
            processTextWithTerms={processTextWithTerms}
            handleTermClick={handleTermClick}
            onChatFinish={handleChatFinish}
            onShowChat={handleShowChat}
          />
        </div>

        <MemoizedModal
          isOpen={!!selectedTerm}
          onClose={closeTermModal}
          title={selectedTerm?.title || ""}
        >
          <p>{selectedTerm?.description}</p>
        </MemoizedModal>
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