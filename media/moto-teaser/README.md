# Teaser motos Colombia — 18 s, 1080×1920

Motion graphics estilo UI/UX (tarjetas con rebote *ease-out-back*, cursor que hace clic, mockup de teléfono, subtítulos palabra por palabra, mascota 2.5D) generado por código y renderizado fotograma a fotograma.

**Entregable:** `out/moto_teaser_1080x1920.mp4` (H.264 + AAC, 30 fps, 18,00 s, solo efectos de sonido).
Pista de efectos suelta para la edición con voz: `out/sfx_mix.wav`. Efectos individuales: `sfx/synth/*.wav`.

## Guion y momentos de sonido (fotograma a 30 fps → `cues.json`)

| Escena | Visual | SFX | Fotograma |
|---|---|---|---|
| 0–3 s Gancho | Tarjeta roja entra rebotando, «REALMENTE» resaltado | whoosh (pico) / pop (impacto) | 11 / 13 |
| 3–8 s Problema | Teléfono; el cursor revela 3 tarjetas | click ×3 · beep de alerta en la tarjeta 2 | 124, 162, 200 · 165 |
| 8–13 s Solución | El teléfono se aleja (zoom out); «SÍ» en verde | swoosh / ding | 246 / 278 |
| 13–16 s Marca | La mascota cae y «sella» el nombre del canal | stinger | 396 |
| 16–18 s CTA | «Síguenos. No te dejes ver la cara.» + botón Seguir, fade out rápido | click final suave | 518 |

## Regenerar

Requisitos: Node 18+ con Playwright (Chromium), Python 3 con `numpy` e `imageio-ffmpeg` (o `ffmpeg` en el PATH).

```bash
CHANNEL_NAME="Mi Canal" ./build.sh      # render completo (~4 min)
./build.sh --mux-only                    # solo re-mezclar el audio y volver a unir el MP4
node render.mjs --stills 13,165,396      # previsualizar fotogramas sueltos en out/
```

### Efectos de ElevenLabs

Esta versión usa efectos sintetizados por código (`sfx_synth.py`), porque la API de ElevenLabs no estaba disponible desde el entorno de render. Para cambiarlos por efectos de ElevenLabs:

```bash
export ELEVENLABS_API_KEY=...
python3 sfx_elevenlabs.py                        # 8 efectos → sfx/elevenlabs/*.mp3
SFX_SOURCE=elevenlabs ./build.sh --mux-only
```

El mezclador quita el silencio inicial, limita cada efecto a 1,0 s (el stinger a 1,2 s) y alinea el ataque o el pico de cada uno con su fotograma en `cues.json`.

Tipografía: Poppins (SIL OFL, `fonts/OFL.txt`).
