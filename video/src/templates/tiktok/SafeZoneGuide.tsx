import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE } from "./layout";

/** Editing aid: outlines the TikTok safe zone. Never enable it for export. */
export const SafeZoneGuide: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div
      style={{
        position: "absolute",
        top: SAFE.top,
        bottom: SAFE.bottom,
        left: SAFE.left,
        right: SAFE.right,
        border: "4px dashed rgba(0,255,170,0.9)",
        background: "rgba(0,255,170,0.06)",
      }}
    />
  </AbsoluteFill>
);
