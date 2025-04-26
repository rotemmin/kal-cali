"use client";
import { useState } from "react";
import styles from "./page.module.css";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface DictionaryEntry {
  title: string;
  description: string;
  topic: string;
}

interface ClientDictionaryProps {
  initialData: DictionaryEntry[];
}

export default function ClientDictionary({ initialData }: ClientDictionaryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [groupedData, setGroupedData] = useState(() => {
    return initialData.reduce((acc: Record<string, DictionaryEntry[]>, entry) => {
      if (!acc[entry.topic]) acc[entry.topic] = [];
      acc[entry.topic].push(entry);
      return acc;
    }, {});
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      const grouped = initialData.reduce((acc: Record<string, DictionaryEntry[]>, entry) => {
        if (!acc[entry.topic]) acc[entry.topic] = [];
        acc[entry.topic].push(entry);
        return acc;
      }, {});
      setGroupedData(grouped);
    } else {
      const filtered = initialData.filter((entry) =>
        entry.title.toLowerCase().includes(value.toLowerCase())
      );
      const grouped = filtered.reduce((acc: Record<string, DictionaryEntry[]>, entry) => {
        if (!acc[entry.topic]) acc[entry.topic] = [];
        acc[entry.topic].push(entry);
        return acc;
      }, {});
      setGroupedData(grouped);
    }
  };

  return (
    <div className={styles.dictionaryContainer}>
      <X className={styles.closeButton} onClick={() => router.back()} />
      <div
        className={`${styles.searchBarContainer} ${
          isSearchActive ? styles.searchBarContainerActive : ""
        }`}
      >
        <input
          type="text"
          className={styles.searchBar}
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => setIsSearchActive(true)}
          onBlur={() => {
            if (searchTerm.trim() === "") {
              setIsSearchActive(false);
            }
          }}
        />
        <SearchIcon className={styles.searchIcon} />
      </div>

      <div className={styles.textContainer} dir="ltr">
        <h1 className={styles.dictionaryTitle}>מילון מושגים</h1>

        <div className={styles.dictionaryListContainer}>
          <div className={styles.dictionaryList}>
            {Object.keys(groupedData).length > 0 ? (
              Object.entries(groupedData).map(([topic, entries]) => (
                <div key={topic} className={styles.topicGroup}>
                  <h2 className={styles.topicTitle}>{topic}</h2>
                  <div className={styles.entriesContainer}>
                    {entries.map((entry) => (
                      <div key={entry.title} className={styles.dictionaryEntry}>
                        <h3 className={styles.entryTitle}>{entry.title}</h3>
                        <p className={styles.entryDescription} dir="rtl">
                          {entry.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : searchTerm ? (
              <div className={styles.noResultsContainer}>
                <p className={styles.noResultsHeader}>אופס!</p>
                <p className={styles.noResultsText}>
                  ההגדרה הזו לא נמצאת במילון שלנו.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
} 