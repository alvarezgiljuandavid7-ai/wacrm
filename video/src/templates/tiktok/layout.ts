// TikTok 9:16 canvas and the area that the app UI never covers
// (caption + buttons at the bottom, tabs at the top, icons on the sides).
export const TIKTOK_WIDTH = 1080;
export const TIKTOK_HEIGHT = 1920;

export const SAFE = {
  top: 150,
  bottom: 380,
  left: 60,
  right: 60,
} as const;

export const SAFE_WIDTH = TIKTOK_WIDTH - SAFE.left - SAFE.right;
export const SAFE_BOTTOM_Y = TIKTOK_HEIGHT - SAFE.bottom;

/** Keeps a box of `width` horizontally inside the safe zone. */
export const clampToSafeX = (centerX: number, width: number): number => {
  const half = width / 2;
  return Math.min(
    Math.max(centerX, SAFE.left + half),
    TIKTOK_WIDTH - SAFE.right - half,
  );
};

/** Keeps a box of `height` vertically inside the safe zone. */
export const clampToSafeY = (centerY: number, height: number): number => {
  const half = height / 2;
  return Math.min(Math.max(centerY, SAFE.top + half), SAFE_BOTTOM_Y - half);
};
