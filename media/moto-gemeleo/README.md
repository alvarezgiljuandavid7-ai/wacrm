# Video de prueba «El gemeleo»: 30 s, 1080×1920, sin audio

Video de motion graphics 100 % animado, versión sobria: fondo #F3EDE4 sin cuadrícula, terracota #C0431B, dorado #B8935A, texto #111111, Archivo Black / Archivo. Las transiciones son solo *ease-out*, sin rebote ni overshoot.

**Entregable:** `out/gemeleo_1080x1920.mp4` (H.264, 30 fps, 30,00 s, sin pista de audio).

## Tiempos y regla de lectura

Regla: cada texto debe estar quieto y completamente visible al menos 2 s, más 0,3 s por cada palabra después de la quinta. `render.mjs` comprueba la regla antes de renderizar y se detiene si algún texto no la cumple.

| Escena | Tramo | Texto | Palabras | Mínimo | Visible |
|---|---|---|---|---|---|
| Gancho | 0,0–4,0 s | Pagó la moto… y en un retén se la quitan. | 10 | 3,5 s | 3,52 s |
| Gemeleo | 4,0–8,9 s | EL GEMELEO | 2 | 2,0 s | 4,50 s |
| | | Una moto robada con los números… | 12 | 4,1 s | 4,15 s |
| 3 pasos | 8,9–21,4 s | RUNT (entra en 9,35 s) | 6 | 2,3 s | 11,6 s |
| | | SIMIT (entra en 13,1 s) | 4 | 2,0 s | 7,85 s |
| | | SIJIN (entra en 16,9 s) | 9 | 3,2 s | 4,05 s |
| Alerta | 21,4–26,3 s | Si le dicen ‘no hay tiempo para revisarla’, corra. | 9 | 3,2 s | 4,15 s |
| Marca | 26,3–30,0 s | Juan Gil Motos / Motos en Colombia, con datos. | 3 / 5 | 2,0 s | 3,10 / 2,90 s |

El gancho necesitaba 3,5 s de lectura, más que los 3 s del guion. Por eso las escenas siguientes empiezan unos 0,4–0,9 s más tarde y el tiempo se recupera en el bloque del teléfono.

## Regenerar

```bash
FFMPEG=$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())') node render.mjs
node render.mjs --stills 60,560,760      # fotogramas sueltos para revisar
```

Los tiempos están en `TEXTS` y `SC`, dentro de `gemeleo.html`. Tipografías: Archivo y Archivo Black (SIL OFL, `fonts/`).
