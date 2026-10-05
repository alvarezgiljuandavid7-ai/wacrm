import type { CSSProperties } from "react";
import { brandColors, brandFont } from "../../brand/tokens";

export const MAX_WORDS_PER_LINE = 6;

/**
 * Splits copy into caption lines of at most `maxWords` words. A "\n" in the
 * text forces a break; longer chunks are split into evenly sized lines so we
 * never end up with a lonely last word.
 */
export const splitLines = (
  text: string,
  maxWords: number = MAX_WORDS_PER_LINE,
): string[] =>
  text
    .split("\n")
    .map((chunk) => chunk.trim().split(/\s+/).filter(Boolean))
    .filter((words) => words.length > 0)
    .flatMap((words) => {
      const lineCount = Math.ceil(words.length / maxWords);
      const perLine = Math.ceil(words.length / lineCount);
      const lines: string[] = [];
      for (let i = 0; i < words.length; i += perLine) {
        lines.push(words.slice(i, i + perLine).join(" "));
      }
      return lines;
    });

/** Chunky TikTok caption look: cream fill, thick wine outline, hard shadow. */
export const outlinedText = ({
  fontSize,
  color = brandColors.crema,
  outline = brandColors.vinotinto,
}: {
  fontSize: number;
  color?: string;
  outline?: string;
}): CSSProperties => ({
  fontFamily: brandFont.family,
  fontWeight: brandFont.extrabold,
  fontSize,
  color,
  WebkitTextStroke: `${Math.round(fontSize * 0.22)}px ${outline}`,
  paintOrder: "stroke fill",
  textShadow: `0 ${Math.round(fontSize * 0.08)}px 0 ${brandColors.vinotintoDark}, 0 ${Math.round(
    fontSize * 0.12,
  )}px ${Math.round(fontSize * 0.35)}px rgba(0,0,0,0.45)`,
  whiteSpace: "nowrap",
  letterSpacing: "-0.01em",
});
