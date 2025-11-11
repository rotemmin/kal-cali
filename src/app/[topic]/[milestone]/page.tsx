"use client";
import React, { useState, useCallback, memo, useMemo, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Modal from "@/components/general/Modal";
import Header from "@/components/general/Header";
import "./MilestonePage.css";
import ProgressBar from "../milestones_progress_bar/ProgressBar";
import { X } from "lucide-react";
import MilestoneContent from "./MilestoneContent";
import { useMilestone } from "@/hooks/useMilestone";
import { useDictionary } from "@/hooks/useDictionary";
import MilestoneActions from "./MilestoneActions";
import { hasStickerAnimation, resolveStickerAssetInfo } from "@/utils/stickerAssets";

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
    loading,
    isCurrentMilestoneCompleted,
  } = useMilestone(topic, milestone, normalizedTopic);

  const {
    selectedTerm,
    processTextWithTerms,
    handleTermClick,
    closeTermModal
  } = useDictionary();

  // Local state
  const [isStickerRevealing, setIsStickerRevealing] = useState(false);
  const [mainButtonDisabled, setMainButtonDisabled] = useState(false);

  // Memoized handlers
  const stickerForDisplay = useMemo(() => {
    if (!currentMilestone?.sticker) {
      return undefined;
    }

    if (completedMilestones === totalMilestones - 1) {
      return `/stickers/finalStickers/final_${normalizedTopic}.svg`;
    }

    return currentMilestone.sticker;
  }, [currentMilestone?.sticker, completedMilestones, totalMilestones, normalizedTopic]);

  const stickerAssetInfo = useMemo(
    () => resolveStickerAssetInfo(stickerForDisplay, userGender),
    [stickerForDisplay, userGender]
  );

  const stickerSupportsAnimation = hasStickerAnimation(stickerAssetInfo);
  const shouldAnimateSticker = stickerSupportsAnimation && !isCurrentMilestoneCompleted;

  useEffect(() => {
    setIsStickerRevealing(false);
    setMainButtonDisabled(false);
  }, [currentMilestone]);

  const runCompletionFlow = useCallback(async () => {
    if (mainButtonDisabled) {
      return;
    }

    setMainButtonDisabled(true);

    if (shouldAnimateSticker) {
      setIsStickerRevealing(true);
    }

    try {
      await completeMilestone();
    } finally {
      if (!shouldAnimateSticker) {
        setMainButtonDisabled(false);
      }
    }
  }, [mainButtonDisabled, shouldAnimateSticker, completeMilestone]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleComplete = useCallback(async () => {
    await runCompletionFlow();
  }, [runCompletionFlow]);

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

  const mainButtonText = currentMilestone?.button || "סיימתי";

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
            topic={topic}
            normalizedTopic={normalizedTopic}
            processTextWithTerms={processTextWithTerms}
            handleTermClick={handleTermClick}
            isStickerRevealing={isStickerRevealing}
            isMilestoneCompleted={isCurrentMilestoneCompleted}
          />
        </div>

        <MilestoneActions
          mainButtonText={mainButtonText}
          onMainButtonClick={handleComplete}
          mainButtonDisabled={mainButtonDisabled}
          showMainButton={true}
          topic={topic}
        />

        <MemoizedModal
          isOpen={!!selectedTerm}
          onClose={closeTermModal}
          title={selectedTerm?.title || ""}
        >
          <p>{selectedTerm?.description}</p>
        </MemoizedModal>
      </div>

      {/* <div className="nav-buttons">
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
      </div> */}
    </>
  );
};

export default MilestonePage;