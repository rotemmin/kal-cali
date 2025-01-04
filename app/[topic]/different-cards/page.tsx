"use client";

import React, { useState, useEffect } from "react";

interface CardType {
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

interface CreditCardOptionsData {
  title: string;
  description: {
    male: string;
    female: string;
  };
  types: CardType[];
}

const CreditCardOptions: React.FC = () => {
  const [data, setData] = useState<CreditCardOptionsData | null>(null);
  const userGender: "male" | "female" = "female";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonData: CreditCardOptionsData = require("@/lib/content/topics/different-cards.json");
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

      <h2>סוגי כרטיסי אשראי</h2>
      {data.types.map((type, index) => (
        <div key={index}>
          <h3>{type.title}</h3>
          <p>{type.description[userGender]}</p>
          <h4>הטבות</h4>
          <p>{type.benefits[userGender]}</p>
          <h4>עמלות</h4>
          <p>{type.fees[userGender]}</p>
        </div>
      ))}

      <button onClick={() => window.history.back()}>חזרה</button>
    </div>
  );
};

export default CreditCardOptions;
