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
  const params = useParams();
  const router = useRouter();
  const { topic, milestone } = params as { topic: string; milestone: string };

  const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
  const currentMilestone = data.milestones.find(
    (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
  );

  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{
    title: string;
    description: string;
  } | null>(null);

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

  if (!currentMilestone) {
    return <div>המיילסטון לא נמצא!</div>;
  }

  const userGender: "male" | "female" = "female";

  const processTextWithTerms = (text: string): string => {
    return text.replace(
      /<span data-term='([^']+)'>[^<]+<\/span>/g,
      (match, term) => {
        const cleanTerm = term.replace(/^ש?ב/, "");
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
              <div
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

  // ##############################
  // Milestone Completion Logic
  const supabase = createClientComponentClient();

  const completeMilestone = async () => {
    try {
      // Fetch the current user's session to get the user ID
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        alert("User not logged in!");
        return;
      }

      const userId = session.user.id; // Retrieve the logged-in user's ID

      const response = await fetch("/api/milestoneCompletion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId, // Pass the logged-in user's ID
          topic, // The current topic
          milestone, // The current milestone
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Milestone completed successfully!");
        // Optionally refresh the page or navigate to the next step
      } else {
        alert("Error completing milestone: " + result.message);
      }
    } catch (error) {
      console.error("Error completing milestone:", error);
      alert("An unexpected error occurred.");
    }
  };

  // ##############################

  return (
    <div className="milestone-page">
      <div className="content-container">
        <h1 className="title">{currentMilestone.title}</h1>
        {currentMilestone.title2 && (
          <h2 className="subtitle">{currentMilestone.title2}</h2>
        )}

        {renderDescription(currentMilestone.description[userGender])}

        {currentMilestone.note && (
          <p className="note">{currentMilestone.note[userGender]}</p>
        )}

        {currentMilestone.help && (
          <div className="help-section">
            {currentMilestone.help.type === "chat" && (
              <div className="chat-container">
                {currentMilestone.help.content.map((chat, index) => (
                  <p key={index} className="chat-message">
                    <strong>{chat.from}:</strong> {chat.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="button-container">
          {currentMilestone.additionalLink &&
            currentMilestone.additionalbutton && (
              <button
                onClick={() => router.push(currentMilestone.additionalLink!)}
                className="additional-button"
              >
                {currentMilestone.additionalbutton}
              </button>
            )}

          <button onClick={completeMilestone} className="main-button">
            {currentMilestone.button}
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

// "use client";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// import React, { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import NavigationButton from "@/components/NavigationButton";
// import NoteComponent from "@/app/notes/singleNote";
// import Modal from "@/components/modal";
// import "./MilestonePage.css";

// interface MilestoneDescription {
//   text: string;
//   type: "regular" | "indented";
// }

// interface Milestone {
//   title: string;
//   title2?: string;
//   description: {
//     male: MilestoneDescription[] | string;
//     female: MilestoneDescription[] | string;
//   };
//   note?: {
//     male: string;
//     female: string;
//   };
//   help?: {
//     type: string;
//     content: { from: string; text: string }[];
//   };
//   button: string;
//   additionalbutton?: string;
//   additionalLink?: string;
// }

// interface TopicData {
//   milestones: Milestone[];
// }

// const MilestonePage: React.FC = () => {
//   const params = useParams();
//   const router = useRouter();
//   const { topic, milestone } = params as { topic: string; milestone: string };

//   const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
//   const currentMilestone = data.milestones.find(
//     (m) => m.title.toLowerCase() === decodeURIComponent(milestone).toLowerCase()
//   );

//   const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
//   const [selectedTerm, setSelectedTerm] = useState<{
//     title: string;
//     description: string;
//   } | null>(null);

//   useEffect(() => {
//     import("@/public/dictionary.json").then((dictionaryData) => {
//       const dict: { [key: string]: string } = {};
//       dictionaryData.dictionary.forEach(
//         (entry: { title: string; description: string }) => {
//           dict[entry.title] = entry.description;
//         }
//       );
//       setDictionary(dict);
//     });
//   }, []);

//   if (!currentMilestone) {
//     return <div>המיילסטון לא נמצא!</div>;
//   }

//   const userGender: "male" | "female" = "female";

//   const processTextWithTerms = (text: string): string => {
//     return text.replace(
//       /<span data-term='([^']+)'>[^<]+<\/span>/g,
//       (match, term) => {
//         const cleanTerm = term.replace(/^ש?ב/, "");
//         return `<span class="term-highlight" data-term="${cleanTerm}">${
//           match.match(/>([^<]+)</)?.[1] || cleanTerm
//         }</span>`;
//       }
//     );
//   };

//   const handleTermClick = (event: React.MouseEvent) => {
//     const target = event.target as HTMLElement;
//     if (target.hasAttribute("data-term")) {
//       const term = target.getAttribute("data-term");
//       if (term && dictionary[term]) {
//         setSelectedTerm({
//           title: term,
//           description: dictionary[term],
//         });
//       }
//     }
//   };

//   const renderDescription = (description: MilestoneDescription[] | string) => {
//     if (Array.isArray(description)) {
//       return (
//         <div className="description-container">
//           {description.map((item, index) => (
//             <p
//               key={index}
//               className={`description-text ${
//                 item.type === "indented" ? "indented" : ""
//               }`}
//             >
//               <div
//                 onClick={handleTermClick}
//                 dangerouslySetInnerHTML={{
//                   __html: processTextWithTerms(item.text),
//                 }}
//               />
//             </p>
//           ))}
//         </div>
//       );
//     }

//     return (
//       <div
//         className="description"
//         onClick={handleTermClick}
//         dangerouslySetInnerHTML={{
//           __html: processTextWithTerms(description),
//         }}
//       />
//     );
//   };

//   // ##############################
//   // Milestone Completion Logic
//   const supabase = createClientComponentClient();

//   const completeMilestone = async () => {
//     try {
//       // Fetch the current user's session to get the user ID
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();

//       if (!session || !session.user) {
//         alert("User not logged in!");
//         return;
//       }

//       const userId = session.user.id; // Retrieve the logged-in user's ID

//       // Fetch current user activity from Supabase
//       const { data, error: fetchError } = await supabase
//         .from("user_activity")
//         .select("topics_and_milestones, budget")
//         .eq("user_id", userId)
//         .single();

//       if (fetchError) {
//         console.error("Error fetching user activity:", fetchError.message);
//         alert("An error occurred while fetching user activity.");
//         return;
//       }

//       const topicsAndMilestones = data.topics_and_milestones;
//       topicsAndMilestones[topic].milestones[milestone] = 1;

//       // Check if all milestones are completed for the topic
//       const allDone = Object.values(
//         topicsAndMilestones[topic].milestones
//       ).every((status) => status === 1);

//       let updatedBudget = data.budget;

//       if (allDone) {
//         topicsAndMilestones[topic].status = 1;
//         updatedBudget += 1;
//       }

//       // Update the milestone and budget in Supabase
//       const { error: updateError } = await supabase
//         .from("user_activity")
//         .update({
//           topics_and_milestones: topicsAndMilestones,
//           budget: updatedBudget,
//         })
//         .eq("user_id", userId);

//       if (updateError) {
//         console.error("Error updating milestone:", updateError.message);
//         alert("An error occurred while updating the milestone.");
//         return;
//       }

//       alert("Milestone completed successfully!");
//     } catch (error) {
//       console.error("Error completing milestone:", error);
//       alert("An unexpected error occurred.");
//     }
//   };

//   // ##############################

//   return (
//     <div className="milestone-page">
//       <div className="content-container">
//         <h1 className="title">{currentMilestone.title}</h1>
//         {currentMilestone.title2 && (
//           <h2 className="subtitle">{currentMilestone.title2}</h2>
//         )}

//         {renderDescription(currentMilestone.description[userGender])}

//         {currentMilestone.note && (
//           <p className="note">{currentMilestone.note[userGender]}</p>
//         )}

//         {currentMilestone.help && (
//           <div className="help-section">
//             {currentMilestone.help.type === "chat" && (
//               <div className="chat-container">
//                 {currentMilestone.help.content.map((chat, index) => (
//                   <p key={index} className="chat-message">
//                     <strong>{chat.from}:</strong> {chat.text}
//                   </p>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         <div className="button-container">
//           {currentMilestone.additionalLink &&
//             currentMilestone.additionalbutton && (
//               <button
//                 onClick={() => router.push(currentMilestone.additionalLink!)}
//                 className="additional-button"
//               >
//                 {currentMilestone.additionalbutton}
//               </button>
//             )}

//           <button onClick={completeMilestone} className="main-button">
//             {currentMilestone.button}
//           </button>
//         </div>
//       </div>

//       <div className="navigation-buttons">
//         <NavigationButton label="מילון" link="/dictionary" position="right" />
//         <NavigationButton label="תפריט" link="/burger_menu" position="left" />
//       </div>

//       <Modal
//         isOpen={!!selectedTerm}
//         onClose={() => setSelectedTerm(null)}
//         title={selectedTerm?.title || ""}
//       >
//         <p>{selectedTerm?.description}</p>
//       </Modal>

//       <NoteComponent topicId={topic} />
//     </div>
//   );
// };

// export default MilestonePage;
