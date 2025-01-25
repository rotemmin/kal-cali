"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface InvestmentType {
  title: string;
  details: string;
}

interface Criterion {
  title: string;
  details: string;
}

interface InvestmentOptionsData {
  title: string;
  description: {
    male: string;
    female: string;
  };
  investment_types: InvestmentType[];
  how_to_choose: {
    title: string;
    criteria: Criterion[];
  };
  important_notes: string[];
}

const InvestmentOptions: React.FC = () => {
  const params = useParams();
  const { topic } = params as { topic: string };

  const [data, setData] = useState<InvestmentOptionsData | null>(null);
  const userGender: "male" | "female" = "female"; // ברירת מחדל

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData: InvestmentOptionsData = require("@/lib/content/topics/investment_options.json");
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
      <h2>סוגי מסלולי השקעה</h2>
      {data.investment_types.map((type, index) => (
        <div key={index}>
          <h3>{type.title}</h3>
          <p>{type.details}</p>
        </div>
      ))}
      <h2>{data.how_to_choose.title}</h2>
      {data.how_to_choose.criteria.map((criterion, index) => (
        <div key={index}>
          <h3>{criterion.title}</h3>
          <p>{criterion.details}</p>
        </div>
      ))}
      <h3>מה חשוב לזכור בבחירת מסלול?</h3>
      <ul>
        {data.important_notes.map((note, index) => (
          <li key={index}>{note}</li>
        ))}
      </ul>
      <button onClick={() => window.history.back()}>חזרה</button>
    </div>
  );
};

export default InvestmentOptions;
