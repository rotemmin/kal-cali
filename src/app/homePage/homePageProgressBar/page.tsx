"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import "./homeProgressBar.css";

const HomeProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("User not logged in");
        return;
      }

      try {
        // Fetch user activity data from Firestore
        const userActivityRef = doc(db, "user_activity", user.uid);
        const userActivitySnap = await getDoc(userActivityRef);
        
        if (userActivitySnap.exists()) {
          const data = userActivitySnap.data();
          
          if (data.topics_and_milestones) {
            const completedCount = Object.values(
              data.topics_and_milestones || {}
            ).filter((topic: any) => topic.status === 1).length;
            
            setProgress((completedCount / 6) * 100);
          } else {
            console.warn("No topics_and_milestones data found");
          }
        } else {
          console.error("User activity data not found");
        }
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="homepage-progress-wrapper">
      <div className="homepage-progress-container">
        <div
          className="homepage-progress-bar"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--color-primary)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default HomeProgressBar;