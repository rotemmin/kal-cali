import React from "react";
import "./ProgressBar.css";

interface ProgressBarProps {
  totalMilestones: number;
  completedMilestones: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  totalMilestones,
  completedMilestones,
}) => {
  return (
    <div className="progress-bar-container">
      {Array.from({ length: totalMilestones }).map((_, index) => (
        <div
          key={index}
          className={`progress-bar-dot ${
            index < completedMilestones ? "completed" : ""
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressBar;
