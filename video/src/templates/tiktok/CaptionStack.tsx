import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brandColors, brandFont } from "../../brand/tokens";
import { SAFE, SAFE_WIDTH } from "./layout";
import { outlinedText } from "./text";

export type CaptionLine = {
  text: string;
  /** Frame (relative to the parent Sequence) the line starts entering. */
  enterAt: number;
  color?: string;
  outline?: string;
  /** Already fully visible on its first frame (hooks must not fade in). */
  instant?: boolean;
  /** First word punches in from big to normal size. */
  popFirstWord?: boolean;
};

const enterProgress = (frame: number, fps: number, line: CaptionLine) =>
  line.instant
    ? 1
    : frame < line.enterAt
      ? 0
      : spring({
          frame: Math.max(0, frame - line.enterAt),
          fps,
          config: { damping: 200 },
          durationInFrames: 14,
        });

/**
 * Caption lines that stack like a chat: a new line pushes older ones away
 * and at most `maxVisible` lines are on screen at any moment.
 */
export const CaptionStack: React.FC<{
  lines: CaptionLine[];
  /** Pixel y of the stack's top edge (anchor "top") or bottom edge ("bottom"). */
  y: number;
  anchor: "top" | "bottom";
  maxVisible?: 1 | 2;
  maxFontSize?: number;
  /** Frame (relative) where the whole stack starts leaving. */
  exitAt?: number;
}> = ({ lines, y, anchor, maxVisible = 2, maxFontSize = 96, exitAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Each line gets as big as it can: short punchy lines read larger.
  const sizes = lines.map((line) =>
    Math.min(
      maxFontSize,
      fitText({
        text: line.text,
        withinWidth: SAFE_WIDTH - 0.3 * maxFontSize,
        fontFamily: brandFont.family,
        fontWeight: brandFont.extrabold,
        validateFontIsLoaded: true,
      }).fontSize,
    ),
  );
  const heights = sizes.map((size) => size * 1.12);

  const progress = lines.map((line) => enterProgress(frame, fps, line));
  const entered = progress.reduce((sum, p) => sum + p, 0);
  // How far (in lines) the stack has scrolled to keep `maxVisible` lines.
  const shift = Math.max(0, entered - maxVisible);
  const gone = lines.map((_, j) => Math.min(1, Math.max(0, shift - j)));
  const scrolled = heights.reduce((sum, h, j) => sum + h * gone[j], 0);
  const stackHeight =
    heights.reduce((sum, h, j) => sum + h * progress[j], 0) - scrolled;
  const offsets = heights.map((_, i) =>
    heights.slice(0, i).reduce((sum, h) => sum + h, 0),
  );
  const top = (anchor === "top" ? y : y - stackHeight) - scrolled;

  const exit =
    exitAt === undefined
      ? 0
      : interpolate(frame, [exitAt, exitAt + 10], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, translate: `0px ${-40 * exit}px` }}>
      {lines.map((line, i) => {
        const p = progress[i];
        if (p <= 0 || gone[i] >= 1) return null;
        const fontSize = sizes[i];
        const lineHeight = heights[i];
        const pop = line.instant
          ? 1
          : spring({
              frame: Math.max(0, frame - line.enterAt),
              fps,
              config: { damping: 11, stiffness: 190 },
            });
        const [first, ...rest] = line.text.split(" ");
        const firstWordScale = line.popFirstWord
          ? interpolate(
              spring({
                frame: Math.max(0, frame - line.enterAt),
                fps,
                config: { damping: 9, stiffness: 210 },
              }),
              [0, 1],
              [1.55, 1],
            )
          : 1;

        return (
          <div
            key={`${i}-${line.text}`}
            style={{
              position: "absolute",
              left: SAFE.left,
              width: SAFE_WIDTH,
              top: top + offsets[i],
              height: lineHeight,
              lineHeight: `${lineHeight}px`,
              textAlign: "center",
              opacity: p * (1 - gone[i]),
              translate: `0px ${(1 - p) * lineHeight * 0.45}px`,
              scale: 0.7 + 0.3 * pop,
              ...outlinedText({
                fontSize,
                color: line.color ?? brandColors.crema,
                outline: line.outline ?? brandColors.vinotinto,
              }),
            }}
          >
            {line.popFirstWord ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    scale: firstWordScale,
                    transformOrigin: "50% 70%",
                  }}
                >
                  {first}
                </span>{" "}
                {rest.join(" ")}
              </>
            ) : (
              line.text
            )}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
