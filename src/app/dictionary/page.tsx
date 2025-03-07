"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { SearchIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Header";

const DictionaryPage = () => {
  const router = useRouter();
  const [dictionaryData, setDictionaryData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupedData, setGroupedData] = useState<any>({});
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/dictionary.json");
        const data = await response.json();
        const sortedData = data.dictionary.sort(
          (a: { title: string }, b: { title: string }) =>
            a.title.localeCompare(b.title, "he", { sensitivity: "base" })
        );

        // Group data by topic
        const grouped = sortedData.reduce((acc: any, entry: any) => {
          if (!acc[entry.topic]) acc[entry.topic] = [];
          acc[entry.topic].push(entry);
          return acc;
        }, {});

        setDictionaryData(sortedData);
        setGroupedData(grouped);
      } catch (error) {
        console.error("Error fetching dictionary data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value) {
      // Reset grouping to original data when search is cleared
      const grouped = dictionaryData.reduce((acc: any, entry: any) => {
        if (!acc[entry.topic]) acc[entry.topic] = [];
        acc[entry.topic].push(entry);
        return acc;
      }, {});
      setGroupedData(grouped);
    } else {
      // Filter and regroup data based on search term
      const filtered = dictionaryData.filter((entry: { title: string }) =>
        entry.title.toLowerCase().includes(value.toLowerCase())
      );
      const grouped = filtered.reduce((acc: any, entry: any) => {
        if (!acc[entry.topic]) acc[entry.topic] = [];
        acc[entry.topic].push(entry);
        return acc;
      }, {});
      setGroupedData(grouped);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.mainContainer}>
        <X className={styles.closeButton} onClick={() => router.back()} />
        <div className={styles.dictionaryContainer}>
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
                {loading ? (
                  <div className={styles.loadingContainer}>
                    <p>טוען נתונים...</p>
                  </div>
                ) : Object.keys(groupedData).length > 0 ? (
                  Object.entries(groupedData).map(([topic, entries]: any) => (
                    <div key={topic} className={styles.topicGroup}>
                      <h2 className={styles.topicTitle}>{topic}</h2>
                      <div className={styles.entriesContainer}>
                        {entries.map(
                          (entry: { title: string; description: string }) => (
                            <div
                              key={entry.title}
                              className={styles.dictionaryEntry}
                            >
                              <h3 className={styles.entryTitle}>
                                {entry.title}
                              </h3>
                              <p className={styles.entryDescription} dir="rtl">
                                {entry.description}
                              </p>
                            </div>
                          )
                        )}
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
      </div>
    </>
  );
};

export default DictionaryPage;
