import React from "react";
import { brandColors } from "../../brand/tokens";
import { CaptionStack } from "../../templates/tiktok/CaptionStack";
import { SAFE } from "../../templates/tiktok/layout";
import { splitLines } from "../../templates/tiktok/text";
import type { SceneProps } from "./types";

/** 0:00–0:03 — text on frame 0, punchline in coral at 1.5 s. */
export const HookScene: React.FC<SceneProps> = ({ content }) => {
  const setup = splitLines(content.gancho.linea1);
  const punchline = splitLines(content.gancho.linea2);

  return (
    <CaptionStack
      anchor="top"
      y={SAFE.top + 30}
      maxVisible={2}
      maxFontSize={100}
      exitAt={80}
      lines={[
        ...setup.map((text, i) => ({
          text,
          enterAt: 0,
          instant: true,
          popFirstWord: i === 0,
        })),
        ...punchline.map((text, i) => ({
          text,
          enterAt: 45 + i * 8,
          color: brandColors.coral,
          outline: brandColors.vinotintoDark,
        })),
      ]}
    />
  );
};
