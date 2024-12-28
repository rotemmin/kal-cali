"use client";

import React from "react";
import { useParams } from "next/navigation";

const TopicPage: React.FC = () => {
  const params = useParams();
  const { topic } = params as { topic: string };

  let content;
  try {
    content = require(`@/lib/content/topics/${topic}.json`);
  } catch (error) {
    return <div>הנושא לא נמצא</div>;
  }

  return (
    <div>
      <h1>{content.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content.description }} />
      <ul>
        {content.milestones.map((milestone: any, index: number) => (
          <li key={index}>
            <h2>{milestone.title}</h2>
            <p>{milestone.description}</p>
            {milestone.link && (
              <button
                onClick={() => alert(`סיימת את המשימה: ${milestone.title}`)}
              >
                {milestone.link}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopicPage;
