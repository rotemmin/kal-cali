import React from 'react';
import { useRouter } from "next/navigation";

const NavigationButton = ({ label, link, position }) => {
  const router = useRouter();

  const buttonStyle = {
    position: 'fixed',
    bottom: '20px',
    [position]: '20px',
    padding: '10px 20px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return (
    <button style={buttonStyle} onClick={() => router.push(link)}>
      {label}
    </button>
  );
};

export default NavigationButton;
