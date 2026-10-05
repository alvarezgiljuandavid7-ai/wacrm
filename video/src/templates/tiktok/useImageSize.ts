import { getImageDimensions } from "@remotion/media-utils";
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender } from "remotion";

export type ImageSize = { width: number; height: number };

/** Natural size of an image, holding the render until it is known. */
export const useImageSize = (src: string): ImageSize | null => {
  const [size, setSize] = useState<ImageSize | null>(null);
  const [handle] = useState(() => delayRender(`Measuring ${src}`));

  useEffect(() => {
    getImageDimensions(src)
      .then((dimensions) => {
        setSize(dimensions);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [src, handle]);

  return size;
};
