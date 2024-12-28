"use client";
import React from "react";
import { useParams } from "next/navigation";

const MilestonePage: React.FC = () => {
  const params = useParams();
  const { topic, milestone } = params as { topic: string; milestone: string };

  return (
    <div>
      <h1>{milestone}</h1>
      <p>
        בדף זה תראו תוכן ייחודי ל-{milestone} בנושא {topic}.
      </p>
      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        <p>
          <strong>יועץ:</strong> שלום! איך אוכל לעזור לך?
        </p>
        <p>
          <strong>משתמש:</strong> תודה! אני רוצה להבין איך לבחור מסלול חיסכון.
        </p>
      </div>
      <button>עשיתי זאת!</button>
    </div>
  );
};

export default MilestonePage;
