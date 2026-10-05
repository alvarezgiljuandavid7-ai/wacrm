import { Easing, interpolate, spring } from "remotion";
import type { ImageSize } from "./useImageSize";

/** A point on the photo, normalized: (0,0) top-left, (1,1) bottom-right. */
export type FocusPoint = { x: number; y: number };

export type CameraState = {
  /** Photo point that sits at the center of the frame. */
  x: number;
  y: number;
  /** 1 = photo exactly covers the frame. */
  zoom: number;
  /** Degrees, around the center of the frame. */
  rotation: number;
};

export type MoveEase = "spring" | "punch" | "inOut" | "in" | "out" | "linear";

/** Move one camera channel to `to`, starting at `at` and lasting `dur` frames. */
export type Move = { at: number; dur: number; to: number; ease: MoveEase };

const progressOf = (frame: number, fps: number, move: Move): number => {
  const local = frame - move.at;
  if (local <= 0) return 0;

  if (move.ease === "spring" || move.ease === "punch") {
    return spring({
      frame: local,
      fps,
      durationInFrames: move.dur,
      config:
        move.ease === "punch"
          ? { damping: 14, stiffness: 170, mass: 0.7 }
          : { damping: 200 },
    });
  }

  const easing = {
    inOut: Easing.inOut(Easing.sin),
    in: Easing.in(Easing.sin),
    out: Easing.out(Easing.sin),
    linear: Easing.linear,
  }[move.ease];

  return interpolate(local, [0, move.dur], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

/**
 * Value of a camera channel at `frame`. Each move contributes its share of
 * the distance to its target, so overlapping moves blend instead of cutting
 * and the channel never jumps.
 */
export const track = (
  frame: number,
  fps: number,
  start: number,
  moves: Move[],
): number =>
  moves.reduce(
    (value, move, i) => {
      const previous = i === 0 ? start : moves[i - 1].to;
      return value + progressOf(frame, fps, move) * (move.to - previous);
    },
    start,
  );

/** Extra zoom so a rotated photo still covers the whole frame. */
const rotationCover = (deg: number, width: number, height: number): number => {
  const rad = (Math.abs(deg) * Math.PI) / 180;
  const ratio = Math.max(width / height, height / width);
  return Math.cos(rad) + ratio * Math.sin(rad);
};

export type PhotoBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Where the (unrotated) photo is drawn for a given camera. */
export const photoBox = (
  camera: CameraState,
  photo: ImageSize,
  frameWidth: number,
  frameHeight: number,
): PhotoBox => {
  const cover = Math.max(frameWidth / photo.width, frameHeight / photo.height);
  const scale =
    cover * camera.zoom * rotationCover(camera.rotation, frameWidth, frameHeight);
  const width = photo.width * scale;
  const height = photo.height * scale;
  return {
    left: frameWidth / 2 - camera.x * width,
    top: frameHeight / 2 - camera.y * height,
    width,
    height,
  };
};

/** Screen position of a photo point, so overlays can stick to the food. */
export const projectPoint = (
  point: FocusPoint,
  camera: CameraState,
  photo: ImageSize,
  frameWidth: number,
  frameHeight: number,
): { x: number; y: number } => {
  const box = photoBox(camera, photo, frameWidth, frameHeight);
  const cx = frameWidth / 2;
  const cy = frameHeight / 2;
  const dx = box.left + point.x * box.width - cx;
  const dy = box.top + point.y * box.height - cy;
  const rad = (camera.rotation * Math.PI) / 180;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
};
