import React, { useState, useEffect } from 'react';
import './MilestoneSticker.css';
import Image from 'next/image';

interface MilestoneStickerProps {
  sticker?: string | {
    male: string;
    female: string;
  };
  userGender?: string;
}

export default function MilestoneSticker({ sticker, userGender = "female" }: MilestoneStickerProps) {
  if (!sticker) return null;

  const stickerPath = typeof sticker === "string" 
    ? sticker 
    : userGender === "male" ? sticker.male : sticker.female;

  return (
    <div className="milestone-sticker">
      <Image
        src={stickerPath}
        alt="milestone sticker"
        width={200}
        height={200}
        className="sticker-image"
      />
    </div>
  );
}