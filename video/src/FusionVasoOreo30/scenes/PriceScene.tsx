import { fitText } from "@remotion/layout-utils";
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brandColors, brandFont } from "../../brand/tokens";
import { SAFE_BOTTOM_Y, TIKTOK_WIDTH } from "../../templates/tiktok/layout";
import { SCENES } from "../timeline";
import type { SceneProps } from "./types";

const CARD_WIDTH = 880;
/** 0.8 s at 30 fps — also the beat length of the placeholder track. */
const PULSE_EVERY = 24;

/** 0:22–0:27 — price card slides up from the bottom and pulses on the beat. */
export const PriceScene: React.FC<SceneProps> = ({ content }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { from, duration } = SCENES.precio;

  const enter = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const leave = spring({
    frame: Math.max(0, frame - (duration - 14)),
    fps,
    config: { damping: 200 },
    durationInFrames: 12,
  });

  // Pulse on the global beat grid so it lands with the music.
  const beatPhase = (frame + from) % PULSE_EVERY;
  const pulse = interpolate(beatPhase, [0, 4, PULSE_EVERY], [1, 1.07, 1], {
    easing: (t) => 1 - (1 - t) ** 2,
  });
  const settled = interpolate(frame, [36, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const prefixSize = 64;
  const amountSize = Math.min(
    190,
    fitText({
      text: content.precio.valor,
      withinWidth: CARD_WIDTH - 140 - prefixSize * 3.4,
      fontFamily: brandFont.family,
      fontWeight: brandFont.extrabold,
      validateFontIsLoaded: true,
    }).fontSize,
  );
  const extraSize = Math.min(
    54,
    fitText({
      text: content.precio.extra,
      withinWidth: CARD_WIDTH - 120,
      fontFamily: brandFont.family,
      fontWeight: brandFont.semibold,
      validateFontIsLoaded: true,
    }).fontSize,
  );

  return (
    <div
      style={{
        position: "absolute",
        left: (TIKTOK_WIDTH - CARD_WIDTH) / 2,
        bottom: 1920 - SAFE_BOTTOM_Y + 10,
        width: CARD_WIDTH,
        padding: "34px 50px 40px",
        boxSizing: "border-box",
        borderRadius: 56,
        backgroundColor: brandColors.crema,
        border: `8px solid ${brandColors.vinotinto}`,
        boxShadow: `0 16px 0 ${brandColors.vinotintoDark}, 0 30px 60px rgba(0,0,0,0.5)`,
        textAlign: "center",
        fontFamily: brandFont.family,
        translate: `0px ${(1 - enter) * 700 + leave * 700}px`,
        rotate: `${(1 - enter) * 6}deg`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "center",
          gap: 22,
          color: brandColors.vinotinto,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontWeight: brandFont.semibold, fontSize: prefixSize }}>
          {content.precio.prefijo}
        </span>
        <span
          style={{
            display: "inline-block",
            fontWeight: brandFont.extrabold,
            fontSize: amountSize,
            lineHeight: 1,
            color: brandColors.vinotinto,
            scale: 1 + (pulse - 1) * settled,
          }}
        >
          {content.precio.valor}
        </span>
      </div>
      <div
        style={{
          display: "inline-block",
          marginTop: 10,
          padding: "6px 30px",
          borderRadius: 999,
          backgroundColor: brandColors.coral,
          color: brandColors.crema,
          fontWeight: brandFont.extrabold,
          fontSize: extraSize,
          whiteSpace: "nowrap",
        }}
      >
        {content.precio.extra}
      </div>
    </div>
  );
};
