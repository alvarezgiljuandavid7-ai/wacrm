import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { projectPoint } from "../../templates/tiktok/camera";
import { CaptionStack } from "../../templates/tiktok/CaptionStack";
import { SAFE_BOTTOM_Y, TIKTOK_HEIGHT, TIKTOK_WIDTH } from "../../templates/tiktok/layout";
import { Sticker } from "../../templates/tiktok/Sticker";
import { splitLines } from "../../templates/tiktok/text";
import { cameraAt, SCENES } from "../timeline";
import type { SceneProps } from "./types";

/** 0:03–0:09 — labels pop onto each topping, one after another. */
export const ToppingScene: React.FC<SceneProps> = ({ content, photo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const camera = cameraAt(frame + SCENES.topping.from, fps, content.enfoque);

  return (
    <>
      {content.topping.etiquetas.map((tag, i) => (
        <Sticker
          key={tag.texto}
          text={tag.texto}
          placement={tag.globo}
          anchor={projectPoint(tag, camera, photo, TIKTOK_WIDTH, TIKTOK_HEIGHT)}
          enterAt={12 + i * 20}
          exitAt={160 + i * 3}
        />
      ))}
      <CaptionStack
        anchor="bottom"
        y={SAFE_BOTTOM_Y - 20}
        maxVisible={2}
        maxFontSize={86}
        exitAt={166}
        lines={splitLines(content.topping.subtitulo).map((text, i) => ({
          text,
          enterAt: 82 + i * 8,
        }))}
      />
    </>
  );
};
