"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/general/Header";
import "./home.css";
import NavigationButton from "@/components/general/NavigationButton.jsx";
import dictionaryIcon from "/icons/dictionary.svg";
import notebookIcon from "/icons/notebook.svg";
import HomeProgressBar from "./homePageProgressBar/page";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const topics = [
  {
    title: "ביטוח לאומי",
    icon: "/stickers/finalStickersTitle/title_national_insurance.svg",
    completedIcon: "/stickers/finalStickers/final_national_insurance.svg",
    link: "/national_insurance",
    dbKey: "national_insurance",
  },
  {
    title: "מס הכנסה",
    icon: "/stickers/finalStickersTitle/title_tax.svg",
    completedIcon: "/stickers/finalStickers/final_tax.svg",
    link: "/homePage",
    dbKey: "tax",
  },
  {
    title: "פנסיה",
    icon: "/stickers/finalStickersTitle/title_pension.svg",
    completedIcon: "/stickers/finalStickers/final_pension.svg",
    link: "/pension",
    dbKey: "pension",
  },
  {
    title: "ביטוחים",
    icon: "/stickers/finalStickersTitle/title_insurance.svg",
    completedIcon: "/stickers/finalStickers/final_insurance.svg",
    link: "/homePage",
    dbKey: "insurance",
  },
  {
    title: "תלושי שכר",
    icon: "/stickers/finalStickersTitle/title_salary.svg",
    completedIcon: "/stickers/finalStickers/final_salary.svg",
    link: "/homePage",
    dbKey: "salary",
  },
  {
    title: "כרטיסי אשראי",
    icon: "/stickers/finalStickersTitle/title_credit_card.svg",
    completedIcon: "/stickers/finalStickers/final_credit_card.svg",
    link: "/credit_card",
    dbKey: "credit_card",
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
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.error("User not logged in");
        setLoading(false);
        // Optional: Redirect to login page
        // router.push('/login');
        return;
      }

      try {
        // Fetch user metadata from Firestore
        const userMetadataRef = doc(db, "user_metadata", user.uid);
        const userMetadataSnap = await getDoc(userMetadataRef);
        
        if (userMetadataSnap.exists()) {
          const userData = userMetadataSnap.data();
          setFirstName(userData.first_name || null);
          setUserGender(userData.gender === "male" ? "male" : "female");
        } else {
          console.error("User metadata not found");
        }

        // Fetch user activity data from Firestore
        const userActivityRef = doc(db, "user_activity", user.uid);
        const userActivitySnap = await getDoc(userActivityRef);
        
        if (userActivitySnap.exists()) {
          const activityData = userActivitySnap.data();
          
          // Log the raw data to debug
          console.log(
            "Raw topics_and_milestones data:",
            activityData.topics_and_milestones
          );
          
          const completedTopicsObj: { [key: string]: boolean } = {};
          
          // Check if topics_and_milestones exists
          if (activityData.topics_and_milestones) {
            Object.entries(activityData.topics_and_milestones).forEach(
              ([topic, data]) => {
                // Cast data to any to access status
                completedTopicsObj[topic] = (data as any).status === 1;
                // Log each topic's completion status
                console.log(`Topic ${topic} status:`, (data as any).status);
              }
            );
          }
          
          // Log the final completed topics object
          console.log("Completed topics:", completedTopicsObj);
          setCompletedTopics(completedTopicsObj);
        } else {
          console.error("User activity data not found");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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
                </div>
              </Link>
            );
          })}
        </div>
        <div className="nav-buttons">
          <NavigationButton
            icon="/icons/dictionary.svg"
            link="/dictionary"
            position="right"
            altText="Dictionary"
          />
          <NavigationButton
            icon="/icons/notebook.svg"
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