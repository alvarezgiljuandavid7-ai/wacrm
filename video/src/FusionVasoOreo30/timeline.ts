import { Easing, interpolate } from "remotion";
import { track, type CameraState } from "../templates/tiktok/camera";
import type { FusionVasoProps } from "./schema";

export const FPS = 30;
export const DURATION = 900;
/** The last 10 frames hold still so the phone number can be read. */
export const LAST_MOVING_FRAME = DURATION - 10 - 1;

export const SCENES = {
  gancho: { from: 0, duration: 90 },
  topping: { from: 90, duration: 180 },
  capas: { from: 270, duration: 210 },
  logo: { from: 480, duration: 180 },
  precio: { from: 660, duration: 150 },
  cta: { from: 810, duration: 90 },
} as const;

/** Global frames of the top-to-bottom pan in "Capa por capa". */
export const PAN = { start: 272, end: 465 } as const;

type Enfoque = FusionVasoProps["enfoque"];

/**
 * The pan passes through the "capas" waypoint at constant speed: easing in
 * to it and out of it with durations proportional to distance keeps the
 * velocity continuous at the waypoint.
 */
const panWaypointFrame = (enfoque: Enfoque): number => {
  const first = Math.abs(enfoque.capas.y - enfoque.toppings.y);
  const second = Math.abs(enfoque.base.y - enfoque.capas.y);
  const share = first + second === 0 ? 0.5 : first / (first + second);
  const length = PAN.end - PAN.start;
  return PAN.start + Math.min(length - 1, Math.max(1, Math.round(length * share)));
};

export const cameraAt = (
  frame: number,
  fps: number,
  enfoque: Enfoque,
): CameraState => {
  const { vaso, toppings, logo, capas, base } = enfoque;
  const waypoint = panWaypointFrame(enfoque);
  const hookY = vaso.y + (toppings.y - vaso.y) * 0.6;

  // Hook impact: a short decaying shake on top of the punch-in.
  const shake = 0.006 * Math.exp(-frame / 4);

  const x =
    track(frame, fps, vaso.x, [
      { at: 20, dur: 100, to: toppings.x + 0.02, ease: "inOut" },
      { at: 120, dur: 150, to: toppings.x - 0.02, ease: "inOut" },
      { at: PAN.start, dur: waypoint - PAN.start, to: capas.x, ease: "in" },
      { at: waypoint, dur: PAN.end - waypoint, to: base.x, ease: "out" },
      { at: 468, dur: 45, to: logo.x, ease: "spring" },
      { at: 655, dur: 40, to: vaso.x, ease: "spring" },
    ]) +
    shake * Math.sin(frame * 2.4);

  const y =
    track(frame, fps, vaso.y, [
      { at: 0, dur: 20, to: hookY, ease: "punch" },
      { at: 20, dur: 100, to: toppings.y, ease: "inOut" },
      { at: PAN.start, dur: waypoint - PAN.start, to: capas.y, ease: "in" },
      { at: waypoint, dur: PAN.end - waypoint, to: base.y, ease: "out" },
      { at: 468, dur: 45, to: logo.y, ease: "spring" },
      { at: 655, dur: 40, to: vaso.y, ease: "spring" },
      { at: 810, dur: 79, to: vaso.y - 0.02, ease: "inOut" },
    ]) +
    shake * Math.cos(frame * 2.1);

  const zoom = track(frame, fps, 1, [
    { at: 0, dur: 20, to: 1.25, ease: "punch" },
    { at: 20, dur: 250, to: 1.38, ease: "inOut" },
    { at: PAN.start, dur: PAN.end - PAN.start, to: 1.22, ease: "inOut" },
    { at: 468, dur: 45, to: 1.4, ease: "spring" },
    { at: 513, dur: 142, to: 1.48, ease: "inOut" },
    { at: 655, dur: 40, to: 1, ease: "spring" },
    { at: 695, dur: 115, to: 1.04, ease: "inOut" },
    { at: 810, dur: 79, to: 1.1, ease: "inOut" },
  ]);

  // Price shot: one slow ±2° sway, faded in and out so it never snaps.
  const sway = interpolate(frame, [660, 690, 790, 815], [0, 1, 1, 0], {
    easing: Easing.inOut(Easing.sin),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rotation = 2 * Math.sin(((frame - 660) / 75) * Math.PI) * sway;

  return { x, y, zoom, rotation };
};

/** 0 at the toppings, 1 at the base: drives the side progress rail. */
export const panProgress = (frame: number, fps: number, enfoque: Enfoque) => {
  const { y } = cameraAt(Math.min(frame, PAN.end), fps, enfoque);
  const span = enfoque.base.y - enfoque.toppings.y;
  return Math.min(1, Math.max(0, span === 0 ? 1 : (y - enfoque.toppings.y) / span));
};

/** First global frame at which the pan reaches `layerY`. */
export const layerRevealFrame = (
  layerY: number,
  fps: number,
  enfoque: Enfoque,
): number => {
  const span = enfoque.base.y - enfoque.toppings.y;
  const target = span === 0 ? 0 : (layerY - enfoque.toppings.y) / span;
  for (let f = PAN.start; f <= PAN.end; f++) {
    if (panProgress(f, fps, enfoque) >= target) return f;
  }
  return PAN.end;
};
