import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brandColors } from "../../brand/tokens";
import { CaptionStack } from "../../templates/tiktok/CaptionStack";
import { SAFE, SAFE_BOTTOM_Y } from "../../templates/tiktok/layout";
import { splitLines } from "../../templates/tiktok/text";
import { layerRevealFrame, panProgress, SCENES } from "../timeline";
import type { SceneProps } from "./types";

const RAIL_X = SAFE.left + 34;
const RAIL_TOP = SAFE.top + 230;
const RAIL_BOTTOM = SAFE_BOTTOM_Y - 330;
const RAIL_HEIGHT = RAIL_BOTTOM - RAIL_TOP;

/** 0:09–0:16 — slow top-to-bottom pan with a synced progress rail. */
export const LayersScene: React.FC<SceneProps> = ({ content }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { from, duration } = SCENES.capas;
  const { enfoque } = content;

  const progress = panProgress(frame + from, fps, enfoque);
  const span = enfoque.base.y - enfoque.toppings.y;
  const marks = content.capas.map((capa) =>
    span === 0 ? 0 : (capa.y - enfoque.toppings.y) / span,
  );

  const appear = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 15 });
  const leave = interpolate(frame, [duration - 16, duration - 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const knobY = RAIL_TOP + RAIL_HEIGHT * progress;

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: appear * (1 - leave),
          translate: `${(1 - appear) * -60}px 0px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: RAIL_X - 7,
            top: RAIL_TOP,
            width: 14,
            height: RAIL_HEIGHT,
            borderRadius: 7,
            backgroundColor: "rgba(255,244,226,0.3)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: RAIL_X - 7,
            top: RAIL_TOP,
            width: 14,
            height: RAIL_HEIGHT * progress,
            borderRadius: 7,
            backgroundColor: brandColors.coral,
          }}
        />
        {marks.map((mark, i) => {
          const passed = progress >= mark;
          return (
            <div
              key={content.capas[i].texto}
              style={{
                position: "absolute",
                left: RAIL_X - 15,
                top: RAIL_TOP + RAIL_HEIGHT * mark - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                boxSizing: "border-box",
                border: `6px solid ${brandColors.crema}`,
                backgroundColor: passed ? brandColors.coral : brandColors.vinotinto,
              }}
            />
          );
        })}
        <div
          style={{
            position: "absolute",
            left: RAIL_X - 26,
            top: knobY - 26,
            width: 52,
            height: 52,
            borderRadius: 26,
            boxSizing: "border-box",
            backgroundColor: brandColors.crema,
            border: `10px solid ${brandColors.vinotinto}`,
            boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
          }}
        />
      </div>
      <CaptionStack
        anchor="bottom"
        y={SAFE_BOTTOM_Y - 20}
        maxVisible={1}
        maxFontSize={96}
        exitAt={duration - 16}
        lines={content.capas.flatMap((capa) =>
          splitLines(capa.texto).map((text, i) => ({
            text,
            enterAt: layerRevealFrame(capa.y, fps, enfoque) - from + i * 8,
          })),
        )}
      />
    </>
  );
};
