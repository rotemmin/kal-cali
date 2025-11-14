import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from "@/lib/firebase/client";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { STICKER_ANIMATION_DURATION_MS } from "@/utils/stickerAssets";

interface UserData {
  topics_and_milestones?: {
    [topicKey: string]: {
      status: number;
      milestones: { [milestoneKey: string]: number };
    };
  };
  budget?: number;
  gender?: "male" | "female";
  curr_topic?: string;
}

interface Milestone {
  title: string;
  description: {
    male: any;
    female: any;
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

export const useMilestone = (topic: string, milestone: string, normalizedTopic: string) => {
  const auth = getAuth();
  const router = useRouter();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [milestoneCompleted, setMilestoneCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  const { data, currentMilestone } = useMemo(() => {
    try {
      const topicData = require(`@/lib/content/topics/${normalizedTopic}.json`);
      const foundMilestone = topicData.milestones.find(
        (m: Milestone) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
      );
      return { data: topicData, currentMilestone: foundMilestone };
    } catch (error) {
      console.error('Error loading milestone data:', error);
      return { data: null, currentMilestone: null };
    }
  }, [normalizedTopic, milestone]);

  const { totalMilestones, completedMilestones, userGender } = useMemo(() => {
    if (!userData?.topics_and_milestones?.[normalizedTopic]?.milestones) {
      return { totalMilestones: 0, completedMilestones: 0, userGender: "female" as const };
    }

    const topicData = userData.topics_and_milestones[normalizedTopic];
    const total = Object.keys(topicData.milestones).length;
    const completed = Object.values(topicData.milestones).filter((val) => val === 1).length;
    
    return {
      totalMilestones: total,
      completedMilestones: completed,
      userGender: userData.gender || "female" as const
    };
  }, [userData, normalizedTopic]);

  const isCurrentMilestoneCompletedFromData = useMemo(() => {
    if (!userData?.topics_and_milestones?.[normalizedTopic]?.milestones || !currentMilestone) {
      return false;
    }

    const milestoneKey = currentMilestone.title.replace(/\s/g, "_");
    const topicMilestones = userData.topics_and_milestones[normalizedTopic].milestones;
    return topicMilestones[milestoneKey] === 1;
  }, [userData, normalizedTopic, currentMilestone]);

  const isCurrentMilestoneCompleted = isCurrentMilestoneCompletedFromData || milestoneCompleted;

  const loadUserData = useCallback(async (user: any) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [userActivityDoc, userProfileDoc] = await Promise.all([
        getDoc(doc(db, "user_activity", user.uid)),
        getDoc(doc(db, "users", user.uid))
      ]);

      const activityData = userActivityDoc.exists() ? userActivityDoc.data() : {};
      const profileData = userProfileDoc.exists() ? userProfileDoc.data() : {};

      if (activityData.curr_topic !== normalizedTopic) {
        updateDoc(doc(db, "user_activity", user.uid), {
          curr_topic: normalizedTopic
        }).catch(console.error);
      }

      setUserData({
        ...activityData,
        gender: profileData.gender || "female"
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [normalizedTopic]);

  const completeMilestone = useCallback(async () => {
    if (milestoneCompleted || !currentMilestone || !userData) {
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please Login :)");
      return;
    }

    try {
      setMilestoneCompleted(true);

      const topicsAndMilestones = userData.topics_and_milestones ? { ...userData.topics_and_milestones } : {};
      let currentBudget = userData.budget || 0;

      if (!topicsAndMilestones[normalizedTopic]) {
        topicsAndMilestones[normalizedTopic] = {
          status: 0,
          milestones: {}
        };
      }

      const topicObj = topicsAndMilestones[normalizedTopic];
      if (!topicObj.milestones) {
        topicObj.milestones = {};
      }

      const milestoneKey = currentMilestone.title.replace(/\s/g, "_");
      
      if (topicObj.milestones[milestoneKey] === 1) {
        return;
      }

      topicObj.milestones[milestoneKey] = 1;

      const allComplete = Object.values(topicObj.milestones).every((val) => val === 1);
      if (allComplete) {
        topicObj.status = 1;
        currentBudget += 1;
      }

      await updateDoc(doc(db, "user_activity", user.uid), {
        topics_and_milestones: topicsAndMilestones,
        budget: currentBudget
      });

      setUserData((prev: UserData | null) => ({
        ...prev,
        topics_and_milestones: topicsAndMilestones,
        budget: currentBudget
      }));

      if (allComplete) {
        router.push(`/${topic}/finalPage`);
      } else {
        const delay = currentMilestone.sticker ? STICKER_ANIMATION_DURATION_MS : 0;
        setTimeout(() => router.back(), delay);
      }

    } catch (error) {
      console.error("Error completing milestone:", error);
      setMilestoneCompleted(false);
    }
  }, [milestoneCompleted, currentMilestone, userData, auth.currentUser, normalizedTopic, topic, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, loadUserData);
    return () => unsubscribe();
  }, [loadUserData]);

  return {
    currentMilestone,
    milestoneCompleted,
    totalMilestones,
    completedMilestones,
    userGender,
    completeMilestone,
    normalizedTopic,
    loading,
    isCurrentMilestoneCompleted,
  };
};