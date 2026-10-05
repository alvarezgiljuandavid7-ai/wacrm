import type { ImageSize } from "../../templates/tiktok/useImageSize";
import type { FusionVasoProps } from "../schema";

export type SceneProps = {
  content: FusionVasoProps;
  photo: ImageSize;
  photoSrc: string;
};
