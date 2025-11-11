import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { resolveStickerAssetInfo } from "@/utils/stickerAssets";
import "./MilestoneSticker.css";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface MilestoneStickerProps {
  sticker?: string | {
    male: string;
    female: string;
  };
  userGender?: "male" | "female";
  shouldReveal?: boolean;
  forceShowSource?: boolean;
}

export default function MilestoneSticker({
  sticker,
  userGender = "female",
  shouldReveal = false,
  forceShowSource = false,
}: MilestoneStickerProps) {
  const assetInfo = useMemo(
    () => resolveStickerAssetInfo(sticker, userGender),
    [sticker, userGender]
  );

  const stickerTypeClass = assetInfo.type ? `sticker-type-${assetInfo.type}` : "";

  const [displaySrc, setDisplaySrc] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [animationData, setAnimationData] = useState<any>(null);

  const isLottieAnimation = Boolean(assetInfo.animationPath?.endsWith(".json"));

  const initialSrc = useMemo(() => {
    if (forceShowSource) {
      return assetInfo.sourcePath;
    }

    return assetInfo.placeholderPath || assetInfo.sourcePath;
  }, [forceShowSource, assetInfo.placeholderPath, assetInfo.sourcePath]);

  useEffect(() => {
    setIsRevealing(false);
    setAnimationData(null);
    setDisplaySrc(initialSrc);
    setAnimationData(null);
  }, [initialSrc]);

  useEffect(() => {
    if (!shouldReveal || forceShowSource) {
      return;
    }

    if (isLottieAnimation) {
      setIsRevealing(true);
      fetch(assetInfo.animationPath as string)
        .then((response) => response.json())
        .then((data) => setAnimationData(data))
        .catch((error) => {
          console.error("Failed to load sticker animation:", error);
          setIsRevealing(false);
        });
      return;
    }

    if (assetInfo.animationPath) {
      setIsRevealing(true);
      setDisplaySrc(assetInfo.animationPath);
      return;
    }
  }, [shouldReveal, assetInfo.animationPath, isLottieAnimation, forceShowSource]);

  if (!displaySrc && !animationData) {
    return null;
  }

  const showAnimation = shouldReveal && !forceShowSource && isLottieAnimation && Boolean(animationData);

  return (
    <div className={`milestone-sticker ${isRevealing ? "revealing" : ""} ${stickerTypeClass}`}>
      {displaySrc && (
        <Image
          src={displaySrc}
          alt="milestone sticker"
          width={200}
          height={200}
          className={`sticker-image ${forceShowSource ? "sticker-image-final" : ""}`}
          priority={isRevealing}
        />
      )}

      {showAnimation && (
        <div className="sticker-animation-wrapper">
          <Lottie
            animationData={animationData}
            loop={false}
            autoplay
            style={{ width: "100%", height: "100%", transform: "scale(1.35)" }}
          />
        </div>
      )}
    </div>
  );
}