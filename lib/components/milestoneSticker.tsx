import React, { useState, useEffect } from 'react';
import './MilestoneSticker.css';

type MilestoneStickerProps = {
  stickerPath: string;
  isCompleted: boolean;
}

const MilestoneSticker: React.FC<MilestoneStickerProps> = ({ stickerPath, isCompleted }) => {
  const [isFloating, setIsFloating] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (isCompleted) {
      // מתחילים את אנימציית התזוזה
      setIsFloating(true);
      
      // מסירים מה-DOM אחרי שהאנימציה מסתיימת
      const removeTimeout = setTimeout(() => {
        setShouldRender(false);
      }, 2000); // 2 שניות - מספיק זמן לאנימציה להסתיים

      return () => clearTimeout(removeTimeout);
    }
  }, [isCompleted]);

  if (!stickerPath || !shouldRender) return null;
 
  const cleanPath = stickerPath
    .replace('@', '')
    .replace('app\\', '')
    .replace(/\\/g, '/');
 
  return (
    <div className="sticker-container">
      <div className={`sticker-wrapper ${isFloating ? 'animate-to-notebook' : ''}`}>
        <img
          src={cleanPath}
          alt="Milestone sticker"
          className="sticker-image"
        />
      </div>
    </div>
  );
};

export default MilestoneSticker;