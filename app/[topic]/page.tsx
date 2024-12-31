"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import NavigationButton from '@/components/NavigationButton';


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

const TopicPage: React.FC = () => {
  const params = useParams();
  const { topic } = params as { topic: string };

  const data: TopicData = require(`@/lib/content/topics/${topic}.json`);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description.female}</p>
      {data.milestones.map((milestone, index) => (
        <div key={index}>
          <Link href={`/${topic}/${milestone.title}`}>
            <button>{milestone.title}</button>
          </Link>
        </div>
      ))}
      <NavigationButton label="מילון" link="/dictionary" position="right" />
      <NavigationButton label="תפריט" link="/burger_menu" position="left" />
    </div>
  );
};

export default TopicPage;
