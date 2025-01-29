"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/lib/components/Header";
import "./home.css";
import NavigationButton from "@/lib/components/NavigationButton";
import dictionaryIcon from "@/public/icons/dictionary.svg";
import notebookIcon from "@/public/icons/notebook.svg";
import HomeProgressBar from "./homePageProgressBar/homeProgressBar";

const supabase = createClient();

const topics = [
  {
    title: "ביטוח לאומי",
    icon: "/icons/onlyTitleStickers/national_insurance.svg",
    completedIcon: "/icons/stickers/final_national_insurance.svg",
    link: "/national_insurance",
    dbKey: "national_insurance", // NEW: Added explicit database key
  },
  {
    title: "מס הכנסה",
    icon: "/icons/onlyTitleStickers/tax.svg",
    completedIcon: "/icons/stickers/final_tax.svg",
    link: "/homePage",
    dbKey: "tax",
  },
  {
    title: "פנסיה",
    icon: "/icons/onlyTitleStickers/pension.svg",
    completedIcon: "/icons/stickers/final_pension.svg",
    link: "/pension",
    dbKey: "pension",
  },
  {
    title: "ביטוחים",
    icon: "/icons/onlyTitleStickers/insurance.svg",
    completedIcon: "/icons/stickers/final_bituchim.svg",
    link: "/homePage",
    dbKey: "insurance",
  },
  {
    title: "תלושי שכר",
    icon: "/icons/onlyTitleStickers/salary.svg",
    completedIcon: "/icons/stickers/final_tlushim.svg",
    link: "/homePage",
    dbKey: "salary",
  },
  {
    title: "חשבון בנק",
    icon: "/icons/onlyTitleStickers/bank.svg",
    completedIcon: "/icons/stickers/final_bank_account.svg",
    link: "/bank_account",
    dbKey: "bank_account",
  },
];

const HomePage = () => {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState<"male" | "female">("female");
  const [completedTopics, setCompletedTopics] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          console.error("User session not found");
          setLoading(false);
          return;
        }

        const userId = session.user.id;

        const { data: userData, error: userError } = await supabase
          .from("user_metadata")
          .select("first_name, sex")
          .eq("id", userId)
          .single();

        if (userError) {
          console.error("Error fetching user metadata:", userError);
        } else {
          setFirstName(userData?.first_name || null);
          setUserGender(userData?.sex === "male" ? "male" : "female");
        }

        // Fetch and log user's topics completion status
        const { data: activityData, error: activityError } = await supabase
          .from("user_activity")
          .select("topics_and_milestones")
          .eq("id", userId)
          .single();

        if (activityError) {
          console.error("Error fetching user activity:", activityError);
        } else {
          // Log the raw data to debug
          console.log(
            "Raw topics_and_milestones data:",
            activityData?.topics_and_milestones
          );

          const completedTopicsObj: { [key: string]: boolean } = {};
          Object.entries(activityData?.topics_and_milestones || {}).forEach(
            ([topic, data]) => {
              completedTopicsObj[topic] = (data as any).status === 1;
              // Log each topic's completion status
              console.log(`Topic ${topic} status:`, (data as any).status);
            }
          );

          // Log the final completed topics object
          console.log("Completed topics:", completedTopicsObj);
          setCompletedTopics(completedTopicsObj);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <>
      <Header />
      <main className="main-container">
        <div className="page-header">
          {loading ? (
            <h1 className="main-title">טוען...</h1>
          ) : (
            <h1 className="main-title">
              {firstName ? `היי ${firstName}!` : "היי!"}
            </h1>
          )}
          <h2 className="sub-title">
            {userGender === "male"
              ? "מה תרצה לעשות היום?"
              : "מה תרצי לעשות היום?"}
          </h2>
        </div>
        <div className="grid-container rtl">
          {topics.map((topic, index) => {
            const isCompleted = completedTopics[topic.dbKey];

            return (
              <Link
                href={topic.link}
                key={index}
                className="grid-item"
                onClick={() => console.log("Selected topic:", topic.dbKey)}
              >
                <div className="icon-container">
                  <Image
                    src={isCompleted ? topic.completedIcon : topic.icon}
                    alt={topic.title}
                    fill
                    sizes="(max-width: 480px) 100px,
                          (max-width: 768px) 120px,
                          142px"
                    style={{ objectFit: "contain" }}
                    priority={index < 2}
                  />
                  {/* <Image
                    src={isCompleted ? topic.completedIcon : topic.icon}
                    alt={topic.title}
                    fill
                    style={{ objectFit: "contain" }}
                    priority={index < 2}
                  /> */}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="nav-buttons">
          <NavigationButton
            icon={dictionaryIcon}
            link="/dictionary"
            position="right"
            altText="Dictionary"
          />
          <NavigationButton
            icon={notebookIcon}
            link="/personal_notebook"
            position="left"
            altText="Notebook"
          />
        </div>
        <HomeProgressBar />
      </main>
    </>
  );
};

export default HomePage;
