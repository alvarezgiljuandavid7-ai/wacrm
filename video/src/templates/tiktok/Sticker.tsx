import { measureText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brandColors, brandFont } from "../../brand/tokens";
import { clampToSafeX, clampToSafeY } from "./layout";

export type StickerPlacement =
  | "arriba-izquierda"
  | "arriba-derecha"
  | "abajo-izquierda"
  | "abajo-derecha";

const FONT_SIZE = 54;
const PAD_X = 34;
const PILL_HEIGHT = FONT_SIZE * 1.55;
const OFFSET_X = 150;
const OFFSET_Y = 150;

/**
 * Wine pill label pinned to a point on the product. `anchor` is in screen
 * pixels and is recomputed every frame, so the label rides the camera.
 */
export const Sticker: React.FC<{
  text: string;
  anchor: { x: number; y: number };
  placement: StickerPlacement;
  enterAt: number;
  exitAt: number;
}> = ({ text, anchor, placement, enterAt, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < enterAt) return null;

  const local = frame - enterAt;
  const dot = spring({ frame: local, fps, config: { damping: 12, stiffness: 220 } });
  const line = interpolate(local, [3, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const pill = spring({
    frame: Math.max(0, local - 6),
    fps,
    config: { damping: 10, stiffness: 170 },
  });
  const exit = spring({
    frame: Math.max(0, frame - exitAt),
    fps,
    config: { damping: 200 },
    durationInFrames: 12,
  });

  const width =
    measureText({
      text,
      fontFamily: brandFont.family,
      fontWeight: brandFont.extrabold,
      fontSize: FONT_SIZE,
      validateFontIsLoaded: true,
    }).width +
    PAD_X * 2;
  const left = placement.endsWith("izquierda");
  const up = placement.startsWith("arriba");
  const cx = clampToSafeX(anchor.x + (left ? -OFFSET_X : OFFSET_X), width);
  const cy = clampToSafeY(anchor.y + (up ? -OFFSET_Y : OFFSET_Y), PILL_HEIGHT);
  const attachY = cy + (up ? PILL_HEIGHT / 2 : -PILL_HEIGHT / 2);
  const tilt = left ? -4 : 4;
  // Idle float so the label keeps breathing while it is on screen.
  const float = Math.sin((local + (left ? 0 : 20)) / 9) * 5;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, scale: 1 - exit * 0.15 }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", overflow: "visible" }}
      >
        <line
          x1={anchor.x}
          y1={anchor.y}
          x2={anchor.x + (cx - anchor.x) * line}
          y2={anchor.y + (attachY + float - anchor.y) * line}
          stroke={brandColors.crema}
          strokeWidth={6}
          strokeLinecap="round"
        />
        <circle
          cx={anchor.x}
          cy={anchor.y}
          r={16 * dot}
          fill={brandColors.coral}
          stroke={brandColors.crema}
          strokeWidth={6}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - width / 2,
          top: cy - PILL_HEIGHT / 2 + float,
          width,
          height: PILL_HEIGHT,
          borderRadius: PILL_HEIGHT / 2,
          backgroundColor: brandColors.vinotinto,
          border: `6px solid ${brandColors.crema}`,
          boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
          boxSizing: "border-box",
          color: brandColors.crema,
          fontFamily: brandFont.family,
          fontWeight: brandFont.extrabold,
          fontSize: FONT_SIZE,
          lineHeight: `${PILL_HEIGHT - 12}px`,
          textAlign: "center",
          whiteSpace: "nowrap",
          scale: pill,
          rotate: `${tilt * pill}deg`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
