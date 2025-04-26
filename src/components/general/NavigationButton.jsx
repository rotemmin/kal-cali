import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NavigationButton = ({ icon, link, position, altText }) => {
  const router = useRouter();

  const buttonStyle = {
    position: "fixed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    bottom: "20px",
    [position]: "0", // Flush to the edge
    margin: "0", // Remove margin
    padding: "0", // Remove padding
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
