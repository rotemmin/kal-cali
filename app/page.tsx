import React from "react";
import Image from "next/image";
import Link from "next/link";
import './home.css';

const topics = [
  { title: "חשבון בנק", icon: "/icons/bank.svg", link: "/bank-account" },
  { title: "מס הכנסה", icon: "/icons/tax.svg", link: "/bank-account" },
  { title: "פנסיה", icon: "/icons/pension.svg", link: "/pension" },
  { title: "ביטוחים", icon: "/icons/insurance.svg", link: "/bank-account" },
  { title: "תלושי שכר", icon: "/icons/salary.svg", link: "/bank-account" },
  { title: "ביטוח לאומי", icon: "/icons/national-insurance.svg", link: "/national-insurance" },
];

const HomePage = () => {
  return (
    <main className="main-container">
      <div className="page-header">
        <h1 className="main-title">היי!</h1>
        <h2 className="sub-title">מה תרצי לעשות היום?</h2>
      </div>
      <div className="grid-container rtl">
        {topics.map((topic, index) => (
          <Link 
            href={topic.link} 
            key={index}
            className="grid-item"
          >
            <div className="icon-container" style={{ animationDelay: `${index * 0.2}s` }}>
              <Image
                src={topic.icon}
                alt={topic.title}
                fill
                style={{ objectFit: 'contain' }}
                priority={index < 2}
              />
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
};

export default HomePage;