interface GenderedSticker {
  male: string;
  female: string;
}

type StickerInput = string | GenderedSticker | undefined;

export interface StickerAssetInfo {
  sourcePath: string | null;
  placeholderPath: string | null;
  animationPath: string | null;
  type: "title" | "drawing" | "final" | "generic";
}

const LITTLE_TITLE_DIR = "/stickers/littleStickersTitle/";
const LITTLE_TITLE_PLACEHOLDER_DIR = "/stickers/littleStickersTitle/";
const LITTLE_TITLE_ANIMATION_DIR = "/stickers/littleStickersTitleAnima/";

const LITTLE_DRAWING_DIR = "/stickers/littleStickersDrawing/";
const LITTLE_DRAWING_PLACEHOLDER_DIR = "/stickers/littleStickersDrawing/";
const LITTLE_DRAWING_ANIMATION_DIR = "/stickers/littleStickersDrawingAnima/";

const FINAL_DIR = "/stickers/finalStickers/";
const FINAL_PLACEHOLDER_DIR = "/stickers/finalStickersEmpty/";

const extractBaseName = (path: string, prefixRegex: RegExp) => {
  const fileName = path.split("/").pop() || "";
  const match = fileName.match(prefixRegex);
  return match?.[1] || null;
};

const buildStickerInfo = (path: string, gender?: "male" | "female"): StickerAssetInfo => {
  if (path.includes(LITTLE_TITLE_DIR)) {
    const base = extractBaseName(path, /title_(.+)\.svg/i);
    if (!base) {
      return {
        sourcePath: path,
        placeholderPath: path,
        animationPath: null,
        type: "title",
      };
    }

    const genderSegment = gender ? `${gender}/` : "";

    return {
      sourcePath: path,
      placeholderPath: `${LITTLE_TITLE_PLACEHOLDER_DIR}pre_title_${base}.svg`,
      animationPath: `${LITTLE_TITLE_ANIMATION_DIR}${genderSegment}anima_title_${base}.json`,
      type: "title",
    };
  }

  if (path.includes(LITTLE_DRAWING_DIR)) {
    const base = extractBaseName(path, /drawing_(.+)\.svg/i);
    if (!base) {
      return {
        sourcePath: path,
        placeholderPath: path,
        animationPath: null,
        type: "drawing",
      };
    }

    return {
      sourcePath: path,
      placeholderPath: `${LITTLE_DRAWING_PLACEHOLDER_DIR}pre_drawing_${base}.svg`,
      animationPath: `${LITTLE_DRAWING_ANIMATION_DIR}anima_drawing_${base}.json`,
      type: "drawing",
    };
  }

  if (path.includes(FINAL_DIR)) {
    const base = extractBaseName(path, /final_(.+)\.svg/i);
    if (!base) {
      return {
        sourcePath: path,
        placeholderPath: path,
        animationPath: null,
        type: "final",
      };
    }

    return {
      sourcePath: path,
      placeholderPath: `${FINAL_PLACEHOLDER_DIR}empty_${base}.svg`,
      animationPath: null,
      type: "final",
    };
  }

  return {
    sourcePath: path,
    placeholderPath: path,
    animationPath: null,
    type: "generic",
  };
};

const resolveGenderedStickerPath = (sticker: StickerInput, gender: "male" | "female"): string | null => {
  if (!sticker) return null;
  if (typeof sticker === "string") return sticker;

  if (gender === "male" && sticker.male) return sticker.male;
  if (gender === "female" && sticker.female) return sticker.female;

  return sticker.male || sticker.female || null;
};

export const resolveStickerAssetInfo = (
  sticker: StickerInput,
  gender: "male" | "female"
): StickerAssetInfo => {
  const path = resolveGenderedStickerPath(sticker, gender);
  if (!path) {
    return {
      sourcePath: null,
      placeholderPath: null,
      animationPath: null,
      type: "generic",
    };
  }

  return buildStickerInfo(path, gender);
};

export const hasStickerAnimation = (info: StickerAssetInfo) => Boolean(info.animationPath);

export const STICKER_ANIMATION_DURATION_MS = 3600;

