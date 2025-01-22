"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { debounce } from "lodash";
import styles from "./page.module.css";

interface Note {
  id: string;
  user_id: string;
  note: string;
  curr_topic: string;
}

interface Topic {
  id: string;
  curr_topic: string;
}

const supabase = createClient();

const PersonalNotebookPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  const [topics, setTopics] = useState<Topic[]>([
    { id: "1", curr_topic: "Topic 1" },
    { id: "2", curr_topic: "Topic 2" },
    { id: "3", curr_topic: "Topic 3" },
  ]);
  const [userId, setUserId] = useState<string | null>("test-user-id");
  const [currentTopic, setCurrentTopic] = useState<string | null>("Topic 1");

  // const [topics, setTopics] = useState<Topic[]>([]);
  // const [userId, setUserId] = useState<string | null>(null);
  // const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>("");

  const fetchNotes = useCallback(
    async (userId: string, topic: string | null) => {
      if (!topic) return;

      const mockNotes = [
        {
          id: "1",
          user_id: "test-user-id",
          curr_topic: "Topic 1",
          note: "Note for Topic 1",
        },
        {
          id: "2",
          user_id: "test-user-id",
          curr_topic: "Topic 2",
          note: "Note for Topic 2",
        },
      ];

      const topicNotes = mockNotes.filter(
        (note) => note.user_id === userId && note.curr_topic === topic
      );

      setNotes(topicNotes || []);
      setNoteText(topicNotes.length > 0 ? topicNotes[0].note : "");
    },
    []
  );

  useEffect(() => {
    if (userId && currentTopic) {
      fetchNotes(userId, currentTopic);
    }
  }, [userId, currentTopic, fetchNotes]);

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNoteText(newNote);

    const updateDb = debounce(async (newNote: string) => {
      if (userId && currentTopic) {
        if (newNote.trim() === "") {
          setNotes(notes.filter((note) => note.curr_topic !== currentTopic));
          return;
        }

        const updatedNotes = notes.map((note) =>
          note.curr_topic === currentTopic ? { ...note, note: newNote } : note
        );
        setNotes(updatedNotes);
      }
    }, 500);

    updateDb(newNote);
  };

  return (
    <div className={styles.notebookContainer}>
      <div className={styles.sidebar}>
        <div className={styles.topicGroup}>
          {topics.map((topic) => (
            <div
              key={topic.id}
              className={`${styles.topic} ${
                currentTopic === topic.curr_topic ? styles.selected : ""
              }`}
              onClick={() => setCurrentTopic(topic.curr_topic)}
            >
              {topic.curr_topic}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.content}>
        {currentTopic ? (
          <div className={styles.notesSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.title}>{currentTopic}</span>
            </div>
            <textarea
              className={styles.notesTextarea}
              value={noteText}
              onChange={handleNoteChange}
              placeholder="כתוב כאן..."
            />
          </div>
        ) : (
          <p>No topic selected.</p>
        )}
      </div>
    </div>
  );
};

export default PersonalNotebookPage;

//   const fetchUserActivity = useCallback(async (userId: string) => {
//     const { data, error } = await supabase
//       .from("user_activity")
//       .select("curr_topic")
//       .eq("id", userId)
//       .single();

//     if (error) {
//       setErrorMessage("Failed to fetch user activity.");
//       return;
//     }

//     if (data) {
//       setCurrentTopic(data.curr_topic);
//     }
//   }, []);

//   const fetchNotes = useCallback(
//     async (userId: string, topic: string | null) => {
//       if (!topic) return;

//       const { data, error } = await supabase
//         .from("notes")
//         .select("*")
//         .eq("user_id", userId)
//         .eq("curr_topic", topic);

//       if (error) {
//         setErrorMessage("Failed to load notes.");
//         return;
//       }

//       setNotes(data || []);
//       setNoteText(data && data.length > 0 ? data[0].note : "");
//     },
//     []
//   );

//   const fetchTopics = useCallback(async () => {
//     const { data, error } = await supabase.from("topics").select("*");

//     if (error) {
//       setErrorMessage("לא הצלחנו לטעון את הנושאים");
//       return;
//     }

//     setTopics(data || []);
//   }, []);

//   const fetchUser = useCallback(async () => {
//     const { data, error } = await supabase.auth.getUser();

//     if (error) {
//       setErrorMessage("לא הצלחנו לאמת את המשתמש");
//       return;
//     }

//     const user = data?.user;
//     if (user) {
//       setUserId(user.id);
//       await fetchUserActivity(user.id);
//       await fetchTopics();
//     }
//   }, [fetchUserActivity, fetchTopics]);

//   useEffect(() => {
//     if (!userId) {
//       fetchUser();
//     }
//   }, [userId, fetchUser]);

//   useEffect(() => {
//     if (userId && currentTopic) {
//       fetchNotes(userId, currentTopic);
//     }
//   }, [userId, currentTopic, fetchNotes]);

//   const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
//     const newNote = event.target.value;
//     setNoteText(newNote);

//     const updateDb = debounce(async (newNote: string) => {
//       if (userId && currentTopic) {
//         if (newNote.trim() === "") {
//           const { error } = await supabase
//             .from("notes")
//             .delete()
//             .eq("user_id", userId)
//             .eq("curr_topic", currentTopic);

//           if (error) {
//             setErrorMessage("לא הצלחנו למחוק את ההערה שלך");
//           }
//           return;
//         }

//         const { error } = await supabase.from("notes").upsert(
//           {
//             user_id: userId,
//             curr_topic: currentTopic,
//             note: newNote,
//           },
//           { onConflict: "user_id, curr_topic" }
//         );

//         if (error) {
//           setErrorMessage("לא הצלחנו לשמור את ההערה שלך");
//         }
//       }
//     }, 500);

//     updateDb(newNote);
//   };

//   // const groupedNotes = notes.reduce(
//   //   (groups: Record<string, Note[]>, note: Note) => {
//   //     const topic = topics.find((topic) => topic.id === note.topic_id);
//   //     const topicName = topic ? topic.name : "Unknown Topic";

//   //     if (!groups[topicName]) {
//   //       groups[topicName] = [];
//   //     }
//   //     groups[topicName].push(note);
//   //     return groups;
//   //   },
//   //   {}
//   // );

//   return (
//     <div className={styles.notebookContainer}>
//       <div className={styles.sidebar}>
//           <div className={styles.topicGroup}>
//             {topics.map((topic) => (
//               <div
//                 key={topic.id}
//                 className={`${styles.topic} ${
//                   currentTopic === topic.curr_topic ? styles.selected : ""
//                 }`}
//                 onClick={() => setCurrentTopic(topic.curr_topic)}
//               >
//                 {topic.curr_topic}
//               </div>
//             ))}
//           </div>
//         <div className={styles.content}>
//           {currentTopic ? (
//             <div className={styles.notesSection}>
//               <div className={styles.sectionHeader}>
//                 <span className={styles.title}>{currentTopic}</span>
//               </div>
//               <textarea
//                 className={styles.notesTextarea}
//                 value={noteText}
//                 onChange={handleNoteChange}
//                 placeholder="כתוב כאן..."
//               />
//             </div>
//           ) : (
//             <p>No topic selected.</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PersonalNotebookPage;
