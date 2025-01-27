"use client";
import { supabase } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/NavigationButton";
import Modal from "@/components/modal";
import Header from "@/lib/components/Header";
import "./MilestonePage.css";
import Image from "next/image";

interface MilestoneDescription {
  text: string;
  type: "regular" | "indented";
}

interface Milestone {
  title: string;
  title2?: string;
  description: {
    male: MilestoneDescription[] | string;
    female: MilestoneDescription[] | string;
  };
  note?: {
    male: string;
    female: string;
  };
  help?: {
    type: string;
    content: { from: string; text: string }[];
  };
  button: string;
  additionalbutton?: string;
  additionalLink?: string;
}

interface TopicData {
  milestones: Milestone[];
}

const MilestonePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };
  const normalizedTopic = topic.replace(/-/g, "_"); // Replace hyphens with underscores
  const data: TopicData = require(`@/lib/content/topics/${normalizedTopic}.json`);

  const currentMilestone = data.milestones.find(
    (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
  );

  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [milestoneCompleted, setMilestoneCompleted] = useState(false);
  const [userGender, setUserGender] = useState<"male" | "female">("female");

  const updateCurrentTopic = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        console.error("User session not found");
        return;
      }

      const userId = session.user.id;

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

  useEffect(() => {
    updateCurrentTopic();
  }, [normalizedTopic]);

  useEffect(() => {
    // Fetch the user's gender from Supabase
    const fetchGender = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          const { data, error } = await supabase
            .from("user_metadata")
            .select("sex")
            .eq("id", session.user.id)
            .single();

          if (!error) {
            setUserGender(data?.sex === "male" ? "male" : "female");
          }
        }
      } catch (error) {
        console.error("Error fetching user gender:", error);
      }
    };

    fetchGender();

    // Load the dictionary
    import("@/public/dictionary.json").then((dictionaryData) => {
      const dict: { [key: string]: string } = {};
      dictionaryData.dictionary.forEach(
        (entry: { title: string; description: string }) => {
          dict[entry.title] = entry.description;
        }
      );
      setDictionary(dict);
    });
  }, []);

  const processTextWithTerms = (text: string): string => {
    if (typeof text !== "string") return "";
    return text.replace(
      /<span data-term='([^']+)'>[^<]+<\/span>/g,
      (match, term) => {
        const cleanTerm = term.replace(/^\u05e9?\u05d1/, "");
        return `<span class="term-highlight" data-term="${cleanTerm}">${
          match.match(/>([^<]+)</)?.[1] || cleanTerm
        }</span>`;
      }
    );
  };

  const handleTermClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute("data-term")) {
      const term = target.getAttribute("data-term");
      if (term && dictionary[term]) {
        setSelectedTerm({
          title: term,
          description: dictionary[term],
        });
      }
    }
  };

  const renderDescription = (description: MilestoneDescription[] | string) => {
    if (Array.isArray(description)) {
      return (
        <div className="description-container">
          {description.map((item, index) => (
            <p
              key={index}
              className={`description-text ${
                item.type === "indented" ? "indented" : ""
              }`}
            >
              <span
                onClick={handleTermClick}
                dangerouslySetInnerHTML={{
                  __html: processTextWithTerms(item.text),
                }}
              />
            </p>
          ))}
        </div>
      );
    }

    return (
      <div
        className="description"
        onClick={handleTermClick}
        dangerouslySetInnerHTML={{
          __html: processTextWithTerms(description),
        }}
      />
    );
  };

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  return (
    <>
      <Header />
      <div className="milestone-page">
        <div className="content-container">
          <h1 className="title">{currentMilestone?.title}</h1>
          {currentMilestone?.title2 && (
            <h2 className="subtitle">{currentMilestone.title2}</h2>
          )}

          {renderDescription(currentMilestone?.description[userGender])}

          {currentMilestone?.note && (
            <div className="note">
              <div
                dangerouslySetInnerHTML={{
                  __html: currentMilestone.note[userGender].replace(
                    /\n/g,
                    "<br />"
                  ),
                }}
              />
            </div>
          )}

          <div className="button-container">
            <button
              onClick={() => console.log("Milestone Completed")}
              className="main-button"
            >
              {currentMilestone?.button}
            </button>
          </div>
        </div>

        <div className="navigation-buttons">
          <NavigationButton label="מילון" link="/dictionary" position="right" />
          <NavigationButton label="תפריט" link="/burger_menu" position="left" />
        </div>

        <Modal
          isOpen={!!selectedTerm}
          onClose={() => setSelectedTerm(null)}
          title={selectedTerm?.title || ""}
        >
          <p>{selectedTerm?.description}</p>
        </Modal>
      </div>
    </>
  );
};

export default MilestonePage;
