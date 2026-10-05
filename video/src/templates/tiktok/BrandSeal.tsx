import React from "react";
import { Img } from "remotion";
import { brandColors, brandFont } from "../../brand/tokens";
import type { ImageSize } from "./useImageSize";

export type SealCrop = { x: number; y: number; ancho: number; alto: number };

/**
 * Round brand stamp. Shows `logoSrc` when there is a logo file, otherwise
 * crops the printed label straight out of the product photo.
 */
export const BrandSeal: React.FC<{
  size: number;
  ringText: string;
  logoSrc: string | null;
  photoSrc: string;
  photo: ImageSize;
  crop: SealCrop;
  /** Degrees; the ring text slowly turns with it. */
  spin?: number;
}> = ({ size, ringText, logoSrc, photoSrc, photo, crop, spin = 0 }) => {
  const inner = size * 0.74;
  const radius = size * 0.405;
  const ringFont = size * 0.085;
  const pathId = `seal-ring-${ringText.replace(/\W/g, "")}`;

  // Crop window sized to the label's aspect ratio, fit inside the circle.
  const cropAspect = (crop.alto * photo.height) / (crop.ancho * photo.width);
  const cropWidth = inner * 0.92;
  const cropHeight = cropWidth * cropAspect;
  const drawnWidth = cropWidth / crop.ancho;
  const drawnHeight = drawnWidth * (photo.height / photo.width);

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: brandColors.vinotinto,
        boxShadow: "0 18px 40px rgba(0,0,0,0.45)",
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ position: "absolute", inset: 0, rotate: `${spin}deg` }}
      >
        <defs>
          <path
            id={pathId}
            d={`M ${size / 2},${size / 2} m -${radius},0 a ${radius},${radius} 0 1,1 ${
              radius * 2
            },0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text
          fill={brandColors.crema}
          fontFamily={brandFont.family}
          fontWeight={brandFont.extrabold}
          fontSize={ringFont}
          letterSpacing={ringFont * 0.18}
        >
          <textPath href={`#${pathId}`} textLength={2 * Math.PI * radius - ringFont}>
            {`${ringText.toUpperCase()} • `.repeat(ringText.length > 18 ? 1 : 2)}
          </textPath>
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: (size - inner) / 2,
          top: (size - inner) / 2,
          width: inner,
          height: inner,
          borderRadius: "50%",
          backgroundColor: brandColors.crema,
          border: `${size * 0.02}px solid ${brandColors.coral}`,
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {logoSrc ? (
          <Img
            src={logoSrc}
            style={{ width: cropWidth, height: cropWidth, objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              position: "relative",
              width: cropWidth,
              height: cropHeight,
              overflow: "hidden",
              borderRadius: size * 0.04,
            }}
          >
            <Img
              src={photoSrc}
              style={{
                position: "absolute",
                width: drawnWidth,
                height: drawnHeight,
                left: -crop.x * drawnWidth,
                top: -crop.y * drawnHeight,
                maxWidth: "none",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
