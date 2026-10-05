import { z } from "zod";

const punto = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
});

/**
 * Everything that changes from one cup to the next lives in this one object:
 * copy, price, phone, assets and the focus points on the photo (normalized
 * 0–1, measured on the photo itself). Timing stays in timeline.ts.
 */
export const fusionVasoSchema = z.object({
  /** Path inside public/. */
  foto: z.string(),
  musica: z.object({
    src: z.string(),
    volumen: z.number().min(0).max(1),
  }),
  /** Whoosh + impact that lands on frame 0. */
  sfxGancho: z.string(),
  marca: z.string(),
  telefono: z.string(),
  enfoque: z.object({
    vaso: punto,
    toppings: punto,
    logo: punto,
    capas: punto,
    base: punto,
  }),
  gancho: z.object({
    /** Use "\n" to choose where the first sentence breaks. */
    linea1: z.string(),
    linea2: z.string(),
  }),
  topping: z.object({
    etiquetas: z.array(
      punto.extend({
        texto: z.string(),
        globo: z.enum([
          "arriba-izquierda",
          "arriba-derecha",
          "abajo-izquierda",
          "abajo-derecha",
        ]),
      }),
    ),
    subtitulo: z.string(),
  }),
  /** Each text appears when the camera's focus passes its `y`. */
  capas: z.array(
    z.object({
      texto: z.string(),
      y: z.number().min(0).max(1),
    }),
  ),
  logo: z.object({
    texto: z.string(),
    /** Optional logo file in public/; when null the label is cropped from the photo. */
    imagen: z.string().nullable(),
    recorte: z.object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      ancho: z.number().min(0).max(1),
      alto: z.number().min(0).max(1),
    }),
  }),
  precio: z.object({
    prefijo: z.string(),
    valor: z.string(),
    extra: z.string(),
  }),
  cta: z.object({
    /** The phone number itself goes inside the WhatsApp button. */
    titulo: z.string(),
  }),
  mostrarZonaSegura: z.boolean(),
});

export type FusionVasoProps = z.infer<typeof fusionVasoSchema>;
