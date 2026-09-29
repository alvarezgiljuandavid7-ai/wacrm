// Renders gemeleo.html frame by frame (Playwright) into a silent 30 s MP4.
//   node render.mjs                        -> out/gemeleo_1080x1920.mp4
//   node render.mjs --stills 10,150,400    -> out/still_XXX.png
// Aborts if any text breaks the reading-time rule (2 s + 0.3 s per word beyond 5).
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FPS = 30, DURATION = 30;
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { chromium } = require(require.resolve('playwright', { paths: [here, execSync('npm root -g').toString().trim()] }));
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, 'gemeleo.html')).href);
await page.evaluate(() => window.ready);

const report = await page.evaluate(() => window.readingReport());
console.table(report);
if (report.some(r => !r.ok)) { await browser.close(); throw new Error('reading-time rule violated'); }

const shot = async f => {
  await page.evaluate(t => window.renderFrame(t), f / FPS);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
};

const si = process.argv.indexOf('--stills');
if (si > 0) {
  for (const f of process.argv[si + 1].split(',').map(Number)) writeFileSync(join(outDir, `still_${String(f).padStart(3, '0')}.png`), await shot(f));
  await browser.close();
  process.exit(0);
}

const out = join(outDir, 'gemeleo_1080x1920.mp4');
const ff = spawn(FFMPEG, [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-r', String(FPS), '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = 0; f < FPS * DURATION; f++) {
  if (!ff.stdin.write(await shot(f))) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 90 === 0) console.log(`frame ${f}/${FPS * DURATION} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
await browser.close();
console.log('wrote', out);
