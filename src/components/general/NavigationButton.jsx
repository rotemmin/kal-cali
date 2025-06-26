import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NavigationButton = ({ icon, link, position, altText }) => {
  const router = useRouter();

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0", 
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  };

  return (
    <button style={buttonStyle} onClick={() => router.push(link)}>
      <Image src={icon} alt={altText} width={60} height={60} />
    </button>
  );
};

export default NavigationButton;
