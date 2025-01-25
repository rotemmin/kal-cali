"use client";
import React, { useEffect, useState } from "react";
import styles from "./milestones_progress_bar.module.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const ProgressBar = ({
  totalMilestones,
  completedMilestones,
}: {
  totalMilestones: number;
  completedMilestones: number;
}) => {
  const dots = Array.from(
    { length: totalMilestones },
    (_, i) => i < completedMilestones
  );

  return (
    <div className={styles.progressBar}>
      {dots.map((isCompleted, index) => (
        <div
          key={index}
          className={`${styles.dot} ${isCompleted ? styles.doneStep : ""}`}
        ></div>
      ))}
    </div>
  );
};

export default function MilestonePage() {
  const supabase = createClientComponentClient();
  const [totalMilestones, setTotalMilestones] = useState(0);
  const [completedMilestones, setCompletedMilestones] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("No user session found");
          return;
        }

        const userId = session.user.id;

        const { data, error } = await supabase
          .from("user_activity")
          .select("topics_and_milestones")
          .eq("id", userId)
          .single();

        if (error || !data) {
          console.error("Error fetching milestones:", error);
          return;
        }

        const topicMilestones = data.topics_and_milestones["current_topic"];
        const completedCount = Object.values(topicMilestones).filter(
          (status) => status === 1
        ).length;

        setTotalMilestones(Object.keys(topicMilestones).length);
        setCompletedMilestones(completedCount);
      } catch (err) {
        console.error("Error fetching progress:", err);
      }
    };

    fetchProgress();
  }, []);

  const completeMilestone = async (milestoneName: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert("No user session found");
        return;
      }

      const userId = session.user.id;

      const { data, error: fetchError } = await supabase
        .from("user_activity")
        .select("topics_and_milestones")
        .eq("id", userId)
        .single();

      if (fetchError || !data) {
        console.error("Error fetching milestones:", fetchError);
        return;
      }

      const topicsAndMilestones = data.topics_and_milestones;
      const currentTopic = "current_topic"; // Replace with the current topic key
      if (topicsAndMilestones[currentTopic][milestoneName] === 1) {
        alert("Milestone already completed!");
        return;
      }

      topicsAndMilestones[currentTopic][milestoneName] = 1;

      const { error: updateError } = await supabase
        .from("user_activity")
        .update({ topics_and_milestones: topicsAndMilestones })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating milestone:", updateError);
        return;
      }

      setCompletedMilestones((prev) => prev + 1);
    } catch (err) {
      console.error("Error completing milestone:", err);
    }
  };

  return (
    <div>
      <h1>Milestone Progress</h1>
      <ProgressBar
        totalMilestones={totalMilestones}
        completedMilestones={completedMilestones}
      />
      <button onClick={() => completeMilestone("milestone_name")}>
        Complete Milestone
      </button>
    </div>
  );
}
