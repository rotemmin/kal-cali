import React from "react";
import TopicButton from "@/components/TopicButton";

const topics = [
  { title: "פנסיה", icon: "/icons/pension.png", link: "/pension" },
  { title: "אשראי", icon: "/icons/credit.png", link: "/credit" },
  { title: "חשבון בנק", icon: "/icons/bank.png", link: "/bank-account" },
  {
    title: "ביטוח לאומי",
    icon: "/icons/national-insurance.png",
    link: "/national-insurance",
  },
];

const HomePage: React.FC = () => {
  return (
    <div>
      {topics.map((topic) => (
        <TopicButton key={topic.title} {...topic} />
      ))}
    </div>
  );
};

export default HomePage;
