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
  // const supabase = createClient(); // Use your custom Supabase client
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

  const completeMilestone = async () => {
    if (milestoneCompleted) {
      alert("You have already completed this milestone!");
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert("No user session found");
        return;
      }

      const userId = session.user.id;

      // Fetch user activity data from the database
      const { data, error: fetchError } = await supabase
        .from("user_activity")
        .select("topics_and_milestones, budget")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError);
        alert("Error fetching user data");
        return;
      }

      const topicsAndMilestones = data?.topics_and_milestones || {};
      let currentBudget = data?.budget || 0;

      // Check if the topic exists in the data
      if (!(normalizedTopic in topicsAndMilestones)) {
        alert("Topic not found in user's activity data");
        return;
      }

      // Access the topic object and its milestones
      const topicObj = topicsAndMilestones[normalizedTopic];
      if (!topicObj.milestones) {
        alert("This topic has no 'milestones' object in the database");
        return;
      }

      // Build the key for the milestone
      const milestoneKey = currentMilestone?.title.replace(/\s/g, "_");
      if (!milestoneKey) {
        alert("Invalid milestone key");
        return;
      }

      // If the milestone is already completed, do nothing
      if (topicObj.milestones[milestoneKey] === 1) {
        alert("Milestone already completed!");
        return;
      }

      // Mark the milestone as completed
      topicObj.milestones[milestoneKey] = 1;

      // Check if all milestones for the topic are complete
      const allComplete = Object.values(topicObj.milestones).every(
        (val) => val === 1
      );

      // If all milestones are complete, mark the topic as complete and increment the budget
      if (allComplete) {
        topicObj.status = 1;
        currentBudget += 1;

        // Show alert when the topic is marked as complete
        alert("Congrats! You have a new sticker!!!");
      }

      // Update the database with the new milestones and budget
      const { error: updateError } = await supabase
        .from("user_activity")
        .update({
          topics_and_milestones: topicsAndMilestones,
          budget: currentBudget,
        })
        .eq("id", userId);

      if (updateError) {
        console.error("Update error:", updateError);
        alert("Error updating milestone in the database");
        return;
      }

      alert("Milestone completed successfully!");
      setMilestoneCompleted(true);
    } catch (error) {
      console.error("Error completing milestone:", error);
      alert("An unexpected error occurred.");
    }
  };

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  const userGender: "male" | "female" = "female";

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
            <button onClick={completeMilestone} className="main-button">
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
