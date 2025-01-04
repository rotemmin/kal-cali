"use client";
import { useEffect, useState } from "react";

const DictionaryPage = () => {
  const [dictionaryData, setDictionaryData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/dictionary.json");
      const data = await response.json();
      const sortedData = data.dictionary.sort(
        (a: { title: string }, b: { title: string }) =>
          a.title.localeCompare(b.title, "he", { sensitivity: "base" })
      );
      setDictionaryData(sortedData);
      setFilteredData(sortedData);
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value === "") {
      setFilteredData(dictionaryData);
    } else {
      const lowercasedValue = value.toLowerCase();
      const filtered = dictionaryData.filter((entry: { title: string }) =>
        entry.title.toLowerCase().includes(lowercasedValue)
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div>
      <h1>מילון פיננסי</h1>

      <div>
        <input
          type="text"
          placeholder="חפש מונח במילון"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div>
        {filteredData.length > 0 ? (
          filteredData.map((entry: { title: string; description: string }) => (
            <div key={entry.title}>
              <h2>{entry.title}</h2>
              <p>{entry.description}</p>
            </div>
          ))
        ) : (
          <p>לא נמצאו תוצאות.</p>
        )}
      </div>
    </div>
  );
};

export default DictionaryPage;
