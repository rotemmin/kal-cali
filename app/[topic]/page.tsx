"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NavigationButton from '@/components/NavigationButton';
import Modal from '@/components/modal';
import dictionaryData from '@/public/dictionary.json';
import NoteComponent from "@/app/notes/singleNote";

interface Milestone {
  title: string;
  link: string;
}

interface TopicData {
  title: string;
  description: {
    male: string;
    female: string;
  };
  milestones: Milestone[];
}

const TopicPage = () => {
  const params = useParams();
  const { topic } = params as { topic: string };
  const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
  
  const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
  const [selectedTerm, setSelectedTerm] = useState<{title: string, description: string} | null>(null);

  useEffect(() => {
    const dict: { [key: string]: string } = {};
    dictionaryData.dictionary.forEach((entry) => {
      dict[entry.title] = entry.description;
    });
    setDictionary(dict);
  }, []);

  const processTextWithTerms = (text: string): string => {
    return text.replace(/<span data-term='([^']+)'>[^<]+<\/span>/g, (match, term) => {
      const cleanTerm = term.replace(/^ש?ב/, '');
      return `<span style="color: purple; cursor: pointer;" data-term="${cleanTerm}">${match.match(/>([^<]+)</)?.[1] || cleanTerm}</span>`;
    });
  };

  const handleTermClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.hasAttribute('data-term')) {
      const term = target.getAttribute('data-term');
      if (term && dictionary[term]) {
        setSelectedTerm({
          title: term,
          description: dictionary[term]
        });
      }
    }
  };

  return (
    <div onClick={handleTermClick}>
      <h1>{data.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: processTextWithTerms(data.description.female) }} />
      {data.milestones.map((milestone, index) => (
        <div key={index}>
          <Link href={`/${topic}/${milestone.title}`}>
            <button>{milestone.title}</button>
          </Link>
        </div>
      ))}
      <NavigationButton label="מילון" link="/dictionary" position="right" />
      <NavigationButton label="תפריט" link="/burger_menu" position="left" />
      <Modal 
        isOpen={!!selectedTerm}
        onClose={() => setSelectedTerm(null)}
        title={selectedTerm?.title || ''}
      >
        <p>{selectedTerm?.description}</p>
      </Modal>
      <NoteComponent />{" "}
    </div>
  );
};

export default TopicPage;

// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useParams } from "next/navigation";
// import NavigationButton from '@/components/NavigationButton';
// import Modal from '@/lib/components/modal';

// interface Milestone {
//   title: string;
//   link: string;
// }

// interface TopicData {
//   title: string;
//   description: {
//     male: string;
//     female: string;
//   };
//   milestones: Milestone[];
// }

// interface DictionaryEntry {
//   title: string;
//   description: string;
// }

// const TopicPage = () => {
//   const params = useParams();
//   const { topic } = params as { topic: string };
//   const data: TopicData = require(`@/lib/content/topics/${topic}.json`);
  
//   const [dictionary, setDictionary] = useState<{ [key: string]: string }>({});
//   const [selectedTerm, setSelectedTerm] = useState<{title: string, description: string} | null>(null);

//   useEffect(() => {
//     const loadDictionary = async () => {
//       try {
//         const response = await fetch('/dictionary.json');
//         const data = await response.json();
//         const dict: { [key: string]: string } = {};
//         data.dictionary.forEach((entry: DictionaryEntry) => {
//           dict[entry.title] = entry.description;
//         });
//         setDictionary(dict);
//       } catch (error) {
//         console.error('Error loading dictionary:', error);
//       }
//     };
//     loadDictionary();
//   }, []);

//   const processTextWithTerms = (text: string) => {
//     return text.replace(/<span data-term='([^']+)'>[^<]+<\/span>/g, (match, term) => {
//       const cleanTerm = term.replace(/^ש?ב/, '');
//       return `<span class="text-blue-600 cursor-pointer hover:underline" data-term="${cleanTerm}">${match.match(/>([^<]+)</)?.[1] || cleanTerm}</span>`;
//     });
//   };

//   const handleTermClick = (event: React.MouseEvent) => {
//     const target = event.target as HTMLElement;
//     if (target.hasAttribute('data-term')) {
//       const term = target.getAttribute('data-term');
//       if (term && dictionary[term]) {
//         setSelectedTerm({
//           title: term,
//           description: dictionary[term]
//         });
//       }
//     }
//   };

//   return (
//     <div className="p-4 max-w-4xl mx-auto" onClick={handleTermClick}>
//       <h1 className="text-2xl font-bold mb-4 text-right">{data.title}</h1>
      
//       <div 
//         className="mb-6 text-right" 
//         dangerouslySetInnerHTML={{ 
//           __html: processTextWithTerms(data.description.female) 
//         }} 
//       />

//       <div className="grid gap-4">
//         {data.milestones.map((milestone, index) => (
//           <Link 
//             key={index} 
//             href={milestone.link.replace('[topic]', topic)}
//             className="block"
//           >
//             <button className="w-full p-3 text-right bg-blue-500 text-white rounded hover:bg-blue-600 transition">
//               {milestone.title}
//             </button>
//           </Link>
//         ))}
//       </div>

//       <div className="fixed bottom-4 w-full max-w-4xl flex justify-between px-4">
//         <NavigationButton label="תפריט" link="/burger_menu" position="left" />
//         <NavigationButton label="מילון" link="/dictionary" position="right" />
//       </div>

//       <Modal 
//         isOpen={!!selectedTerm}
//         onClose={() => setSelectedTerm(null)}
//         title={selectedTerm?.title || ''}
//       >
//         <p>{selectedTerm?.description}</p>
//       </Modal>
//     </div>
//   );
// };

// export default TopicPage;

