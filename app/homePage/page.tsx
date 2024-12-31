import React from "react";
import TopicButton from "@/components/TopicButton";

const topics = [
  { title: "פנסיה", icon: "/icons/pension.png", link: "/pension" },
  { title: "ביטוח לאומי", icon: "/icons/national-insurance.png", link: "/national-insurance" },
  { title: "חשבון בנק וכרטיסי אשראי", icon: "/icons/bank.png", link: "/bank-account" },
  
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
