"use client";

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";


export async function getTopicMilestonesStatus(topicId: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userActivityRef = doc(db, "user_activity", user.uid);
    const docSnap = await getDoc(userActivityRef);

    if (!docSnap.exists()) {
      console.warn("No user activity document found");
      return {};
    }

    const userData = docSnap.data();
    return userData?.topics_and_milestones?.[topicId]?.milestones || {};
  } catch (error) {
    console.error("Error fetching milestone status:", error);
    throw error;
  }
}


export async function updateMilestoneStatus(
  topicId: string,
  milestoneId: string,
  status: number
) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userActivityRef = doc(db, "user_activity", user.uid);
    const docSnap = await getDoc(userActivityRef);

    if (!docSnap.exists()) {
      throw new Error("No user activity document found");
    }

    const userData = docSnap.data();
    
    if (
      !userData.topics_and_milestones ||
      !userData.topics_and_milestones[topicId] ||
      !userData.topics_and_milestones[topicId].milestones
    ) {
      throw new Error(`Topic ${topicId} or its milestones not found`);
    }

    const updateData = {
      [`topics_and_milestones.${topicId}.milestones.${milestoneId}`]: status
    };

    await updateDoc(userActivityRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating milestone status:", error);
    throw error;
  }
}


export async function checkAllMilestonesCompleted(topicId: string) {
  try {
    const milestonesStatus = await getTopicMilestonesStatus(topicId);
    
    if (Object.keys(milestonesStatus).length === 0) {
      return false;
    }

    const allCompleted = Object.values(milestonesStatus).every(
      (status) => status === 1
    );
    
    return allCompleted;
  } catch (error) {
    console.error("Error checking all milestones completion:", error);
    return false;
  }
}


export async function getUserGender() {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userMetadataRef = doc(db, "user_metadata", user.uid);
    const docSnap = await getDoc(userMetadataRef);

    if (!docSnap.exists()) {
      console.warn("No user metadata document found");
      return "female"; 
    }

    const userData = docSnap.data();
    return userData.gender === "male" ? "male" : "female";
  } catch (error) {
    console.error("Error fetching user gender:", error);
    return "female"; 
  }
}


export async function updateTopicStatus(topicId: string, status: number) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User not authenticated");
    }

    const userActivityRef = doc(db, "user_activity", user.uid);
    
    const updateData = {
      [`topics_and_milestones.${topicId}.status`]: status
    };

    await updateDoc(userActivityRef, updateData);
    return true;
  } catch (error) {
    console.error("Error updating topic status:", error);
    throw error;
  }
}