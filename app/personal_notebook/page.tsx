"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Note {
  id: string;
  user_id: string;
  note: string;
  topic_id: string;
}

interface Topic {
  id: string;
  name: string;
}

const supabase = createClient();

const PersonalNotebookPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNotes = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("topic_id", { ascending: true });

    if (error) {
      setErrorMessage("לא הצלחנו לטעון את ההערות שלך");
      return;
    }

    setNotes(data || []);
  }, []);

  const fetchTopics = useCallback(async () => {
    const { data, error } = await supabase.from("topics").select("*");

    if (error) {
      setErrorMessage("לא הצלחנו לטעון את הנושאים");
      return;
    }

    setTopics(data || []);
  }, []);

  const fetchUser = useCallback(async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setErrorMessage("לא הצלחנו לאמת את המשתמש");
      return;
    }

    const user = data?.user;
    if (user) {
      setUserId(user.id);
      fetchNotes(user.id);
    }
  }, [fetchNotes]);

  useEffect(() => {
    if (!userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const groupedNotes = notes.reduce(
    (groups: Record<string, Note[]>, note: Note) => {
      const topic = topics.find((topic) => topic.id === note.topic_id);
      const topicName = topic ? topic.name : "Unknown Topic";

      if (!groups[topicName]) {
        groups[topicName] = [];
      }
      groups[topicName].push(note);
      return groups;
    },
    {}
  );

  return (
    <div>
      <h1>המחברת האישית</h1>

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      {Object.keys(groupedNotes).length > 0 ? (
        Object.keys(groupedNotes)
          .sort()
          .map((topicName) => (
            <div key={topicName}>
              <h2>נושא: {topicName}</h2>
              {groupedNotes[topicName].map((note) => (
                <div key={note.id} style={{ marginBottom: "20px" }}>
                  <h3>הערה</h3>
                  <p>{note.note}</p>
                </div>
              ))}
            </div>
          ))
      ) : (
        <p>לא נמצאו הערות.</p>
      )}
    </div>
  );
};

export default PersonalNotebookPage;
