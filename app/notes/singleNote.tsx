"use client";
import React, { useState, useEffect, useCallback } from "react";
import { isResponseEmpty } from "@/lib/supabase/utils";
import { supabase } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { debounce } from "lodash";

// const supabase: SupabaseClient = createClient();

interface NoteComponentProps {
  topicId: string;
}

const NoteComponent: React.FC<NoteComponentProps> = ({ topicId }) => {
  const [note, setNote] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchNote = useCallback(async () => {
    if (userId && topicId) {
      const { data, error } = await supabase
        .from("notes")
        .select("id, note")
        .eq("user_id", userId)
        .eq("topic_id", topicId)
        .single();

      if (error && !isResponseEmpty(error.code)) {
        setErrorMessage("לא הצלחנו לטעון את ההערה שלך");
        return;
      }

      if (data) {
        setNote(data.note);
      } else {
        setNote("");
      }
    }
  }, [userId, topicId]);

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      setErrorMessage("לא הצלחנו לאמת את המשתמש");
      return;
    }

    const user = data?.user;

    if (user) {
      setUserId(user.id);
    }
  };

  useEffect(() => {
    if (!userId) {
      fetchUser();
    } else {
      fetchNote();
    }
  }, [fetchNote, userId]);

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNote(newNote);

    const updateDb = debounce(async (newNote: string) => {
      if (userId && topicId) {
        if (newNote.trim() === "") {
          const { error } = await supabase
            .from("notes")
            .delete()
            .eq("user_id", userId)
            .eq("topic_id", topicId);

          if (error) {
            setErrorMessage("לא הצלחנו למחוק את ההערה שלך");
          }
          return;
        }

        const { error } = await supabase.from("notes").upsert(
          {
            user_id: userId,
            topic_id: topicId,
            note: newNote,
          },
          { onConflict: "user_id, topic_id" }
        );

        if (error) {
          setErrorMessage("לא הצלחנו לשמור את ההערה שלך");
        }
      }
    }, 500);

    updateDb(newNote);
  };

  return (
    <div style={{ paddingBottom: "120px" }}>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <textarea
        value={note}
        onChange={handleNoteChange}
        placeholder="כתוב את ההערה שלך כאן..."
        rows={10}
        cols={50}
        style={{
          width: "100%",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          resize: "none",
          fontFamily: "Arial, sans-serif",
        }}
      />
    </div>
  );
};

export default NoteComponent;
