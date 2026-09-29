// Renders teaser.html frame by frame with Playwright and pipes the frames to ffmpeg.
//   node render.mjs                 -> out/video_noaudio.mp4
//   node render.mjs --stills 0,13,165,278,396,518   -> out/still_XXX.png (quick previews)
import { createRequire } from 'node:module';
import { spawn, execSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(require.resolve('playwright', { paths: [here, globalRoot] }));

const cfg = JSON.parse(readFileSync(join(here, 'cues.json'), 'utf8'));
if (process.env.CHANNEL_NAME) cfg.channelName = process.env.CHANNEL_NAME;
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });

const stillsArg = process.argv.indexOf('--stills');
const stills = stillsArg > 0 ? process.argv[stillsArg + 1].split(',').map(Number) : null;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.addInitScript(c => { window.CUES = c; }, cfg);
await page.goto(pathToFileURL(join(here, 'teaser.html')).href);
await page.evaluate(() => window.ready);

const shot = async f => {
  await page.evaluate(t => window.renderFrame(t), f / cfg.fps);
  return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 1080, height: 1920 } });
};

if (stills) {
  for (const f of stills) writeFileSync(join(outDir, `still_${String(f).padStart(3, '0')}.png`), await shot(f));
  await browser.close();
  process.exit(0);
}

const out = join(outDir, 'video_noaudio.mp4');
const ff = spawn(FFMPEG, [
  '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(cfg.fps), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-r', String(cfg.fps), '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let f = 0; f < cfg.durationFrames; f++) {
  const buf = await shot(f);
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (f % 60 === 0) process.stdout.write(`frame ${f}/${cfg.durationFrames} (${((Date.now() - t0) / 1000).toFixed(0)}s)\n`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));
await browser.close();
console.log('wrote', out);
