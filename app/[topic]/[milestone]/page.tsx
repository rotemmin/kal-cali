"use client";
import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import NavigationButton from "@/components/NavigationButton";
import Modal from "@/components/modal";
import Header from "@/lib/components/Header";
import "./MilestonePage.css";

// Types
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
  button: string;
}

interface TopicData {
  milestones: Milestone[];
}

const MilestonePage: React.FC = () => {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };
  const normalizedTopic = topic.replace(/-/g, "_");
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

  // Fetch dictionary and update topic
  useEffect(() => {
    const fetchDictionary = async () => {
      const dictionaryData = await import("@/public/dictionary.json");
      const dict: { [key: string]: string } = {};
      dictionaryData.dictionary.forEach((entry: { title: string; description: string }) => {
        dict[entry.title] = entry.description;
      });
      setDictionary(dict);
    };

    fetchDictionary();
    updateCurrentTopic();
  }, [normalizedTopic]);

  // Update topic
  const updateCurrentTopic = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      await supabase.from("user_activity").update({ curr_topic: normalizedTopic }).eq("id", session.user.id);
    } catch (error) {
      console.error("Error updating current topic:", error);
    }
  };

  // Complete milestone
  const completeMilestone = async () => {
    if (milestoneCompleted) {
      alert("You have already completed this milestone!");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("user_activity")
        .select("topics_and_milestones, budget")
        .eq("id", session.user.id)
        .single();

      if (error || !data) return;

      const topicsAndMilestones = data.topics_and_milestones || {};
      const currentBudget = data.budget || 0;

      if (!(normalizedTopic in topicsAndMilestones)) return;

      topicsAndMilestones[normalizedTopic] -= 1;

      const updatedBudget = topicsAndMilestones[normalizedTopic] === 0 ? currentBudget + 1 : currentBudget;

      await supabase.from("user_activity").update({
        topics_and_milestones: topicsAndMilestones,
        budget: updatedBudget,
      }).eq("id", session.user.id);

      setMilestoneCompleted(true);
      router.push(`/app/${topic}`);
    } catch (error) {
      console.error("Error completing milestone:", error);
    }
  };

  // Render description
  const renderDescription = (description: MilestoneDescription[] | string) => {
    if (Array.isArray(description)) {
      return (
        <div className="description-container">
          {description.map((item, index) => (
            <p key={index} className={`description-text ${item.type === "indented" ? "indented" : ""}`}>
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

  // Highlight terms
  const processTextWithTerms = (text: string): string =>
    text.replace(/<span data-term='([^']+)'>[^<]+<\/span>/g, (_, term) => {
      const cleanTerm = term.replace(/^\u05e9?\u05d1/, "");
      return `<span class="term-highlight" data-term="${cleanTerm}">${cleanTerm}</span>`;
    });

  const handleTermClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute("data-term")) {
      const term = target.getAttribute("data-term");
      if (term && dictionary[term]) {
        setSelectedTerm({ title: term, description: dictionary[term] });
      }
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
          <h1 className="title">{currentMilestone.title}</h1>
          {currentMilestone.title2 && <h2 className="subtitle">{currentMilestone.title2}</h2>}
          {renderDescription(currentMilestone.description[userGender])}
          {currentMilestone.note && (
            <div className="note">
              <div
                dangerouslySetInnerHTML={{
                  __html: currentMilestone.note[userGender],
                }}
              />
            </div>
          )}
          <div className="button-container">
            <button onClick={completeMilestone} className="main-button">{currentMilestone.button}</button>
          </div>
        </div>
        <div className="navigation-buttons">
          <NavigationButton label="מילון" link="/dictionary" position="right" />
          <NavigationButton label="תפריט" link="/burger_menu" position="left" />
        </div>
        <Modal isOpen={!!selectedTerm} onClose={() => setSelectedTerm(null)} title={selectedTerm?.title || ""}>
          <p>{selectedTerm?.description}</p>
        </Modal>
      </div>
    </>
  );
};

export default MilestonePage;
