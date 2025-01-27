"use client";
import { supabase } from "@/lib/supabase/client"; // Import Supabase client
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/lib/components/Header";
import "./home.css";

const topics = [
  {
    title: "ביטוח לאומי",
    icon: "/icons/onlyTitleStickers/national_insurance.svg",
    link: "/national_insurance",
  },
  {
    title: "מס הכנסה",
    icon: "/icons/onlyTitleStickers/tax.svg",
    link: "/homePage",
  },
  {
    title: "פנסיה",
    icon: "/icons/onlyTitleStickers/pension.svg",
    link: "/pension",
  },
  {
    title: "ביטוחים",
    icon: "/icons/onlyTitleStickers/insurance.svg",
    link: "/homePage",
  },
  {
    title: "תלושי שכר",
    icon: "/icons/onlyTitleStickers/salary.svg",
    link: "/homePage",
  },
  {
    title: "חשבון בנק",
    icon: "/icons/onlyTitleStickers/bank.svg",
    link: "/bank-account",
  },
];

const HomePage = () => {
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userGender, setUserGender] = useState<"male" | "female">("female");

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

        // Fetch user's first name and gender
        const { data, error } = await supabase
          .from("user_metadata")
          .select("first_name, sex")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("Error fetching user metadata:", error);
        } else {
          setFirstName(data?.first_name || null);
          setUserGender(data?.sex === "male" ? "male" : "female");
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
            const normalizedTopic = topic.link
              .replace(/-/g, "_")
              .replace("/", "");
            return (
              <Link
                href={topic.link}
                key={index}
                className="grid-item"
                onClick={() => console.log("Selected topic:", normalizedTopic)}
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
    </>
  );
};

export default HomePage;
