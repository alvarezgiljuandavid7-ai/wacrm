import "./index.css";
import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { FusionVasoOreo30 } from "./FusionVasoOreo30/FusionVasoOreo30";
import { fusionVasoSchema } from "./FusionVasoOreo30/schema";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          logoColor1: "#91dAE2",
          logoColor2: "#86A8E7",
        }}
      />

      <Folder name="Fusion-TikTok">
        {/*
          npx remotion render FusionVasoOreo30 out/vaso-oreo-30s.mp4 --codec=h264
          For another cup: duplicate this <Composition>, change the id and
          edit defaultProps (or pass --props=vaso.json when rendering).
        */}
        <Composition
          id="FusionVasoOreo30"
          component={FusionVasoOreo30}
          schema={fusionVasoSchema}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            foto: "vaso-fresas-oreo.jpeg",
            musica: { src: "audio/beat.mp3", volumen: 0.25 },
            sfxGancho: "audio/hook-hit.mp3",
            marca: "Fusion By Angie",
            telefono: "319 630 2198",
            enfoque: {
              vaso: { x: 0.5, y: 0.5 },
              toppings: { x: 0.5, y: 0.33 },
              logo: { x: 0.5, y: 0.58 },
              capas: { x: 0.5, y: 0.7 },
              base: { x: 0.5, y: 0.8 },
            },
            gancho: {
              linea1: "Si usted dice que no\nle gustan las fresas con crema…",
              linea2: "…es porque no ha probado estas.",
            },
            topping: {
              etiquetas: [
                { texto: "Oreo crocante", x: 0.35, y: 0.29, globo: "arriba-izquierda" },
                { texto: "Granola", x: 0.57, y: 0.25, globo: "arriba-derecha" },
                { texto: "Fresa fresca", x: 0.645, y: 0.345, globo: "abajo-derecha" },
              ],
              subtitulo: "Y esto es solo lo de arriba.",
            },
            capas: [
              { texto: "Fresas frescas", y: 0.47 },
              { texto: "Crema suave", y: 0.61 },
              { texto: "Salsa de chocolate", y: 0.74 },
            ],
            logo: {
              texto: "Hecho por Angie, en La Unión.",
              imagen: null,
              recorte: { x: 0.331, y: 0.551, ancho: 0.344, alto: 0.117 },
            },
            precio: {
              prefijo: "Desde",
              valor: "$10.000",
              extra: "Toppings extra a $2.500",
            },
            cta: { titulo: "Pídalo por WhatsApp" },
            mostrarZonaSegura: false,
          }}
        />
      </Folder>
    </>
  );
};
