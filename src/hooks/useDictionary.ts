import { useState, useEffect, useMemo, useCallback } from 'react';

interface SelectedTerm {
  title: string;
  description: string;
}

let dictionaryCache: { [key: string]: string } | null = null;

export const useDictionary = () => {
  const [selectedTerm, setSelectedTerm] = useState<SelectedTerm | null>(null);
  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});

  // Load dictionary only once and cache it
  useEffect(() => {
    if (dictionaryCache) {
      setDictionary(dictionaryCache);
      return;
    }

    let mounted = true;
    
    import("@/lib/content/dictionary.json")
      .then((dictionaryData) => {
        if (!mounted) return;
        
        const dict: { [key: string]: string } = {};
        dictionaryData.dictionary.forEach(
          (entry: { title: string; description: string }) => {
            dict[entry.title] = entry.description;
          }
        );
        
        dictionaryCache = dict; // Cache for future use
        setDictionary(dict);
      })
      .catch(console.error);

    return () => {
      mounted = false;
    };
  }, []);

  // Memoized text processing function
  const processTextWithTerms = useMemo(() => {
    return (text: string): string => {
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
  }, []);

  // Optimized term click handler
  const handleTermClick = useCallback((event: React.MouseEvent) => {
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
  }, [dictionary]);

  // Close modal
  const closeTermModal = useCallback(() => {
    setSelectedTerm(null);
  }, []);

  return {
    dictionary,
    selectedTerm,
    processTextWithTerms,
    handleTermClick,
    closeTermModal
  };
};