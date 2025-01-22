"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/NavigationButton";
import NoteComponent from "@/app/notes/singleNote";
import Modal from "@/components/modal";
import "./MilestonePage.css";

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
  const supabase = createClientComponentClient();
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

  // ##############################
  // New Function to Update Current Topic in Database
  const updateCurrentTopic = async () => {
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

      // Update the `curr_topic` field in the database
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

  // ##############################
  // Call updateCurrentTopic when the topic changes
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
      // Get session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        alert("No user session found");
        return;
      }

      const userId = session.user.id;

      // Fetch user activity data
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
      const currentBudget = data?.budget || 0;

      if (!(normalizedTopic in topicsAndMilestones)) {
        alert("Topic not found in user's activity data");
        return;
      }

      const milestonesLeft = topicsAndMilestones[normalizedTopic];
      if (milestonesLeft > 0) {
        topicsAndMilestones[normalizedTopic] -= 1;

        // Check if topic is completed
        let updatedBudget = currentBudget;
        if (topicsAndMilestones[normalizedTopic] === 0) {
          updatedBudget += 1;
        }

        // Update the database
        const { error: updateError } = await supabase
          .from("user_activity")
          .update({
            topics_and_milestones: topicsAndMilestones,
            budget: updatedBudget,
          })
          .eq("id", userId);

        if (updateError) {
          console.error("Update error:", updateError);
          alert("Error updating milestone");
          return;
        }

        alert("Milestone completed successfully!");
        setMilestoneCompleted(true);
        router.refresh();
      } else {
        alert("Milestone already completed!");
      }
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
    <div className="milestone-page">
      <div className="content-container">
        <h1 className="title">{currentMilestone?.title}</h1>
        {currentMilestone?.title2 && (
          <h2 className="subtitle">{currentMilestone.title2}</h2>
        )}

        {renderDescription(currentMilestone?.description[userGender])}

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

      <NoteComponent topicId={topic} />
    </div>
  );
};

export default MilestonePage;
