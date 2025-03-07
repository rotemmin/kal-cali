"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { X } from "lucide-react";
import Header from "@/src/components/Header";
import "./investment_options.css";
import ProgressBar from "../milestones_progress_bar/ProgressBar";

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
  const router = useRouter();
  const { topic } = params as { topic: string };
  const [data, setData] = useState<InvestmentOptionsData | null>(null);
  const userGender: "male" | "female" = "female";

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
    <>
      <Header />
      <div className="investment-options-page">
        <div className="content-container">
          <X className="closeButton" onClick={() => router.back()} />
          
          <h1 className="title">
            {data.title}
          </h1>
          
          <div className="description">
            {data.description[userGender]}
          </div>

          <h2 className="subtitle">
            סוגי מסלולי השקעה
          </h2>
          
          <div className="investment-types">
            {data.investment_types.map((type, index) => (
              <div key={index} className="investment-type-card">
                <h3 className="investment-type-title">
                  {type.title}
                </h3>
                <p className="investment-type-details">
                  {type.details}
                </p>
              </div>
            ))}
          </div>

          <h2 className="subtitle">
            {data.how_to_choose.title}
          </h2>
          
          <div className="criteria">
            {data.how_to_choose.criteria.map((criterion, index) => (
              <div key={index} className="criteria-card">
                <h3 className="investment-type-title">
                  {criterion.title}
                </h3>
                <p className="investment-type-details">
                  {criterion.details}
                </p>
              </div>
            ))}
          </div>

          <h3 className="subtitle">
            מה חשוב לזכור בבחירת מסלול?
          </h3>
          
          <div className="important-notes">
            <ul>
              {data.important_notes.map((note, index) => (
                <li key={index}>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="button-container">
            <button
              onClick={() => router.back()}
              className="main-button"
            >
              חזרה
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestmentOptions;