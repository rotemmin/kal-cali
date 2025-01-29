"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface Plan {
  title: string;
  description: {
    male: string;
    female: string;
  };
  benefits: {
    male: string;
    female: string;
  };
  fees: {
    male: string;
    female: string;
  };
}

interface CreditAccountPlansData {
  title: string;
  description: {
    male: string;
    female: string;
  };
  plans: Plan[];
}

const CreditAccountPlans: React.FC = () => {
  const params = useParams();
  const { topic } = params as { topic: string };
  const [data, setData] = useState<CreditAccountPlansData | null>(null);
  const userGender: "male" | "female" = "female";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData: CreditAccountPlansData = require("@/lib/content/topics/financial_plans.json");
        setData(jsonData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) {
    return <div>טוען...</div>;
  }

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description[userGender]}</p>
      <h2>סוגי מסלולי אשראי</h2>
      {data.plans.map((plan, index) => (
        <div key={index}>
          <h3>{plan.title}</h3>
          <p>{plan.description[userGender]}</p>
          <h4>הטבות</h4>
          <p>{plan.benefits[userGender]}</p>
          <h4>עמלות</h4>
          <p>{plan.fees[userGender]}</p>
        </div>
      ))}
      <button onClick={() => window.history.back()}>חזרה</button>
    </div>
  );
};

export default CreditAccountPlans;
