"use client";

import React from "react";
import nationalInsuranceData from "@/lib/content/national-insurance.json";

const ExemptionsPage: React.FC = () => {
  const milestoneData = nationalInsuranceData.milestones.find(
    (m) => m.title === "מי פטור מביטוח לאומי"
  );

  if (!milestoneData) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  return (
    <div>
      <h1>{milestoneData.title}</h1>
      <p>{milestoneData.description.male}</p>
      {milestoneData.additionalInfoButtons && (
        <ul>
          {milestoneData.additionalInfoButtons.map((info, index) => (
            <li key={index}>
              <strong>{info.title}:</strong> {info.content}
            </li>
          ))}
        </ul>
      )}
      <button onClick={() => window.history.back()}>חזור</button>
    </div>
  );
};

export default ExemptionsPage;
