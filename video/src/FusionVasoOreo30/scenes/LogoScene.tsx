import React from "react";
import { interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandSeal } from "../../templates/tiktok/BrandSeal";
import { CaptionStack } from "../../templates/tiktok/CaptionStack";
import { SAFE, SAFE_BOTTOM_Y, TIKTOK_WIDTH } from "../../templates/tiktok/layout";
import { splitLines } from "../../templates/tiktok/text";
import { SCENES } from "../timeline";
import type { SceneProps } from "./types";

const SEAL_SIZE = 250;

/** 0:16–0:22 — camera pushes into the printed label; the seal stamps in. */
export const LogoScene: React.FC<SceneProps> = ({ content, photo, photoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { duration } = SCENES.logo;

  const stamp = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 9, stiffness: 160 },
  });
  const leave = interpolate(frame, [duration - 16, duration - 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: TIKTOK_WIDTH - SAFE.right - SEAL_SIZE - 10,
          top: SAFE.top + 20,
          opacity: Math.min(1, stamp * 2) * (1 - leave),
          scale: interpolate(stamp, [0, 1], [1.8, 1]) - leave * 0.2,
          rotate: `${interpolate(stamp, [0, 1], [-28, -8])}deg`,
        }}
      >
        <BrandSeal
          size={SEAL_SIZE}
          ringText={`${content.marca} • ${content.telefono}`}
          logoSrc={content.logo.imagen ? staticFile(content.logo.imagen) : null}
          photoSrc={photoSrc}
          photo={photo}
          crop={content.logo.recorte}
          spin={frame * 0.4}
        />
      </div>
      <CaptionStack
        anchor="bottom"
        y={SAFE_BOTTOM_Y - 20}
        maxVisible={2}
        maxFontSize={92}
        exitAt={duration - 16}
        lines={splitLines(content.logo.texto).map((text, i) => ({
          text,
          enterAt: 14 + i * 8,
        }))}
      />
    </>
  );
};
