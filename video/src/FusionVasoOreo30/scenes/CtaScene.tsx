import { fitText } from "@remotion/layout-utils";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brandFont } from "../../brand/tokens";
import { BrandSeal } from "../../templates/tiktok/BrandSeal";
import { SAFE, SAFE_WIDTH } from "../../templates/tiktok/layout";
import { outlinedText } from "../../templates/tiktok/text";
import { WhatsAppButton } from "../../templates/tiktok/WhatsAppButton";
import type { SceneProps } from "./types";

const BOUNCE_START = 36;
const BOUNCE_EVERY = 30;
const BOUNCE_LENGTH = 10;

/**
 * 0:27–0:30 — order on WhatsApp. Every motion settles by frame 76 of the
 * scene (global 886) so the frozen last frames read cleanly.
 */
export const CtaScene: React.FC<SceneProps> = ({ content, photo, photoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dim = interpolate(frame, [0, 14], [0, 0.6], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const seal = spring({ frame, fps, config: { damping: 12, stiffness: 150 } });
  const title = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { damping: 13, stiffness: 170 },
  });
  const button = spring({
    frame: Math.max(0, frame - 14),
    fps,
    config: { damping: 10, stiffness: 160 },
  });

  // Micro-bounce: a short hop every second, then rest.
  const sinceBounce = frame - BOUNCE_START;
  const hopPhase = sinceBounce >= 0 ? sinceBounce % BOUNCE_EVERY : BOUNCE_LENGTH;
  const hop =
    hopPhase < BOUNCE_LENGTH ? Math.sin((hopPhase / BOUNCE_LENGTH) * Math.PI) : 0;

  const titleSize = Math.min(
    96,
    fitText({
      text: content.cta.titulo,
      withinWidth: SAFE_WIDTH - 40,
      fontFamily: brandFont.family,
      fontWeight: brandFont.extrabold,
      validateFontIsLoaded: true,
    }).fontSize,
  );
  // Button = icon + number; leave room for the icon, padding and border.
  const phoneSize = Math.min(
    104,
    fitText({
      text: content.telefono,
      withinWidth: SAFE_WIDTH - 230,
      fontFamily: brandFont.family,
      fontWeight: brandFont.extrabold,
      validateFontIsLoaded: true,
    }).fontSize,
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(67,8,26,${dim * 0.7}) 0%, rgba(30,3,12,${dim}) 75%)`,
        }}
      />
      <AbsoluteFill
        style={{
          top: SAFE.top + 90,
          left: SAFE.left,
          right: SAFE.right,
          bottom: "auto",
          alignItems: "center",
          gap: 56,
        }}
      >
        <div
          style={{
            scale: seal,
            rotate: `${interpolate(seal, [0, 1], [-30, -6])}deg`,
          }}
        >
          <BrandSeal
            size={300}
            ringText={content.marca}
            logoSrc={content.logo.imagen ? staticFile(content.logo.imagen) : null}
            photoSrc={photoSrc}
            photo={photo}
            crop={content.logo.recorte}
          />
        </div>
        <div
          style={{
            ...outlinedText({ fontSize: titleSize }),
            opacity: Math.min(1, title * 1.5),
            scale: 0.6 + 0.4 * title,
            lineHeight: 1.1,
          }}
        >
          {content.cta.titulo}
        </div>
        <div
          style={{
            scale: button * (1 + 0.05 * hop),
            translate: `0px ${-22 * hop}px`,
          }}
        >
          <WhatsAppButton label={content.telefono} fontSize={phoneSize} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
