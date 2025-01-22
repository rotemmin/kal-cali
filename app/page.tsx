"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import Image from "next/image";
import Link from "next/link";
// import "./home.css";

const topics = [
  { title: "חשבון בנק", icon: "/icons/bank.svg", link: "/bank-account" },
  { title: "מס הכנסה", icon: "/icons/tax.svg", link: "/tax" },
  { title: "פנסיה", icon: "/icons/pension.svg", link: "/pension" },
  { title: "ביטוחים", icon: "/icons/insurance.svg", link: "/insurance" },
  { title: "תלושי שכר", icon: "/icons/salary.svg", link: "/salary" },
  {
    title: "ביטוח לאומי",
    icon: "/icons/national_insurance.svg",
    link: "/national_insurance",
  },
];

const HomePage = () => {
  const supabase = createClientComponentClient();

  const updateCurrentTopic = async (normalizedTopic: string) => {
    try {
      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error("User session not found");
        return;
      }

      const userId = session.user.id;

      // Update the `curr_topic` in the database
      const { error } = await supabase
        .from("user_activity")
        .update({ curr_topic: normalizedTopic })
        .eq("id", userId);

      if (error) {
        console.error("Error updating current topic:", error);
      } else {
        console.log("Current topic updated successfully:", normalizedTopic);
      }
    } catch (error) {
      console.error("Error updating current topic:", error);
    }
  };

  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="main-title">היי!</h1>
        <h2 className="sub-title">מה תרצי לעשות היום?</h2>
      </div>
      <div className="grid-container rtl">
        {topics.map((topic, index) => {
          const normalizedTopic = topic.link
            .replace(/-/g, "_")
            .replace("/", "");
          return (
            <Link
              href={topic.link}
              key={index}
              className="grid-item"
              onClick={() => updateCurrentTopic(normalizedTopic)}
            >
              <div className="icon-container">
                <Image
                  src={topic.icon}
                  alt={topic.title}
                  fill
                  style={{ objectFit: "contain" }}
                  priority={index < 2}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
};

export default HomePage;
