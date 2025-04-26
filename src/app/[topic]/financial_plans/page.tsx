"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/general/Header";
import { X } from "lucide-react";
import styles from "./page.module.css";

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
  const router = useRouter();
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
    <>
      <Header />
      <div className={styles.pageContainer}>
        <X className={styles.closeButton} onClick={() => router.back()} />
        <div className={styles.contentContainer}>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.description}>{data.description[userGender]}</p>

          <h2 className={styles.subtitle}>סוגי מסלולי אשראי</h2>

          <div className={styles.cardsContainer}>
            {data.plans.map((plan, index) => (
              <div key={index} className={styles.cardBox}>
                <h3 className={styles.cardTitle}>{plan.title}</h3>
                <p className={styles.cardText}>
                  {plan.description[userGender]}
                </p>

                <div className={styles.cardSection}>
                  <h4 className={styles.sectionTitle}>הטבות</h4>
                  <p className={styles.cardText}>{plan.benefits[userGender]}</p>
                </div>

                <div className={styles.cardSection}>
                  <h4 className={styles.sectionTitle}>עמלות</h4>
                  <p className={styles.cardText}>{plan.fees[userGender]}</p>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.buttonContainer}>
            <button className={styles.mainButton} onClick={() => router.back()}>
              חזרה
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditAccountPlans;
