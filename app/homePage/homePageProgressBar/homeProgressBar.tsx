"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import "./homeProgressBar.css";

const supabase = createClient();

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("User session not found");
          return;
        }

        const userId = session.user.id;

        const { data, error } = await supabase
          .from("user_activity")
          .select("topics_and_milestones")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user activity:", error);
          return;
        }

        const completedCount = Object.values(
          data?.topics_and_milestones || {}
        ).filter((topic: any) => topic.status === 1).length;

        setProgress((completedCount / 6) * 100);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgress();
  }, []);

  return (
    <div className="progress-bar-wrapper moved-down">
      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
            backgroundColor: "var(--color-primary)",
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
