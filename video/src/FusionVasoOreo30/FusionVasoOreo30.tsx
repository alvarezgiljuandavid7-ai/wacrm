import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  Freeze,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { useBrandFontsReady } from "../brand/fonts";
import { brandColors } from "../brand/tokens";
import { CaptionScrim, PhotoStage } from "../templates/tiktok/PhotoStage";
import { SafeZoneGuide } from "../templates/tiktok/SafeZoneGuide";
import { useImageSize } from "../templates/tiktok/useImageSize";
import { CtaScene } from "./scenes/CtaScene";
import { HookScene } from "./scenes/HookScene";
import { LayersScene } from "./scenes/LayersScene";
import { LogoScene } from "./scenes/LogoScene";
import { PriceScene } from "./scenes/PriceScene";
import { ToppingScene } from "./scenes/ToppingScene";
import type { SceneProps } from "./scenes/types";
import type { FusionVasoProps } from "./schema";
import { cameraAt, DURATION, LAST_MOVING_FRAME, SCENES } from "./timeline";

const Visuals: React.FC<SceneProps> = (scene) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { content } = scene;

  return (
    <>
      <PhotoStage
        src={scene.photoSrc}
        photo={scene.photo}
        camera={cameraAt(frame, fps, content.enfoque)}
      />
      <CaptionScrim />
      <Sequence name="Gancho" from={SCENES.gancho.from} durationInFrames={SCENES.gancho.duration}>
        <HookScene {...scene} />
      </Sequence>
      <Sequence name="Topping" from={SCENES.topping.from} durationInFrames={SCENES.topping.duration}>
        <ToppingScene {...scene} />
      </Sequence>
      <Sequence name="Capa por capa" from={SCENES.capas.from} durationInFrames={SCENES.capas.duration}>
        <LayersScene {...scene} />
      </Sequence>
      <Sequence name="Logo" from={SCENES.logo.from} durationInFrames={SCENES.logo.duration}>
        <LogoScene {...scene} />
      </Sequence>
      <Sequence name="Precio" from={SCENES.precio.from} durationInFrames={SCENES.precio.duration}>
        <PriceScene {...scene} />
      </Sequence>
      <Sequence name="CTA" from={SCENES.cta.from} durationInFrames={SCENES.cta.duration}>
        <CtaScene {...scene} />
      </Sequence>
      {content.mostrarZonaSegura ? <SafeZoneGuide /> : null}
    </>
  );
};

export const FusionVasoOreo30: React.FC<FusionVasoProps> = (content) => {
  const fontsReady = useBrandFontsReady();
  const photoSrc = staticFile(content.foto);
  const photo = useImageSize(photoSrc);

  return (
    <AbsoluteFill style={{ backgroundColor: brandColors.vinotintoDark }}>
      {/* Everything visual holds its last moving frame for the final 10 frames. */}
      <Freeze frame={LAST_MOVING_FRAME} active={(f) => f > LAST_MOVING_FRAME}>
        {fontsReady && photo ? (
          <Visuals content={content} photo={photo} photoSrc={photoSrc} />
        ) : null}
      </Freeze>
      <Audio
        name="Beat"
        src={staticFile(content.musica.src)}
        volume={(f) =>
          content.musica.volumen *
          interpolate(f, [DURATION - 30, DURATION], [1, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        }
      />
      <Audio name="Golpe gancho" src={staticFile(content.sfxGancho)} volume={0.9} />
    </AbsoluteFill>
  );
};
