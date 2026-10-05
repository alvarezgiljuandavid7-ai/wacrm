import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { photoBox, type CameraState } from "./camera";
import { TIKTOK_HEIGHT, TIKTOK_WIDTH } from "./layout";
import type { ImageSize } from "./useImageSize";

// Soft top/bottom edge so, when the camera pans past the end of the photo,
// it melts into the blurred backdrop instead of showing a hard border.
const FEATHER =
  "linear-gradient(to bottom, transparent 0%, black 5%, black 93%, transparent 100%)";

/**
 * Product photo filmed by a virtual camera: a blurred, darkened copy fills
 * the frame and the sharp photo moves on top of it.
 */
export const PhotoStage: React.FC<{
  src: string;
  photo: ImageSize;
  camera: CameraState;
  /** 0.6 = background darkened by 40%. */
  backgroundBrightness?: number;
  backgroundBlur?: number;
}> = ({
  src,
  photo,
  camera,
  backgroundBrightness = 0.6,
  backgroundBlur = 48,
}) => {
  const box = photoBox(camera, photo, TIKTOK_WIDTH, TIKTOK_HEIGHT);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          // Slight parallax: the backdrop drifts against the camera.
          translate: `${(0.5 - camera.x) * 80}px ${(0.5 - camera.y) * 80}px`,
          scale: 1.2 + (camera.zoom - 1) * 0.15,
        }}
      >
        <Img
          src={src}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `blur(${backgroundBlur}px) brightness(${backgroundBrightness})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{ rotate: `${camera.rotation}deg` }}>
        <Img
          src={src}
          style={{
            position: "absolute",
            left: box.left,
            top: box.top,
            width: box.width,
            height: box.height,
            // Tailwind preflight caps images at 100% width.
            maxWidth: "none",
            maskImage: FEATHER,
            WebkitMaskImage: FEATHER,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Darkens the top and bottom bands where captions live. */
export const CaptionScrim: React.FC<{ top?: number; bottom?: number }> = ({
  top = 0.4,
  bottom = 0.5,
}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to bottom, rgba(20,4,10,${top}) 0%, rgba(20,4,10,0) 28%, rgba(20,4,10,0) 62%, rgba(20,4,10,${bottom}) 100%)`,
    }}
  />
);
