import React from 'react';
import Link from 'next/link';

type TopicButtonProps = {
  title: string;
  icon: string;
  link: string;
};

const TopicButton: React.FC<TopicButtonProps> = ({ title, icon, link }) => {
  return (
    <Link href={link}>
      <div className="topic-button">
        <img src={icon} alt={`${title} icon`} />
        <span>{title}</span>
      </div>
    </Link>
  );
};

export default TopicButton;
