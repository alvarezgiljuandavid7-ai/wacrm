import { loadFont } from "@remotion/fonts";
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { brandFont } from "./tokens";

// Baloo 2 ships with the project (public/fonts, SIL OFL) so renders never
// depend on the Google Fonts CDN.
const fontsPromise = Promise.all(
  [brandFont.semibold, brandFont.extrabold].map((weight) =>
    loadFont({
      family: brandFont.family,
      url: staticFile(`fonts/Baloo2-${weight}.ttf`),
      weight: String(weight),
    }),
  ),
);

let fontsLoaded = false;
fontsPromise.then(() => {
  fontsLoaded = true;
});

/**
 * Text that is measured (fitText / measureText) must not render before the
 * font is ready, otherwise the fallback font's metrics get cached.
 */
export const useBrandFontsReady = (): boolean => {
  const [ready, setReady] = useState(fontsLoaded);
  const [handle] = useState(() =>
    fontsLoaded ? null : delayRender("Waiting for Baloo 2"),
  );

  useEffect(() => {
    if (handle === null) return;
    fontsPromise.then(() => {
      setReady(true);
      continueRender(handle);
    });
  }, [handle]);

  return ready;
};
