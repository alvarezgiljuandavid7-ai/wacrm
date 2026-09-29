// Generates voiceovers (text-to-speech) and sound effects with ElevenLabs
// from audio.config.json, writing MP3s into public/ so compositions can load
// them with staticFile("voiceover/<id>.mp3") / staticFile("sfx/<id>.mp3").
//
// Usage:
//   npm run audio                 # generate files that don't exist yet
//   npm run audio -- --force      # regenerate everything
//   npm run audio -- intro whoosh # only these ids
//
// Requires ELEVENLABS_API_KEY (read from the environment or video/.env).

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_BASE = "https://api.elevenlabs.io/v1";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONFIG_PATH = join(ROOT, "audio.config.json");
const PUBLIC_DIR = join(ROOT, "public");

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error(
    "Missing ELEVENLABS_API_KEY. Set it in your environment or in video/.env (see .env.example).",
  );
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyIds = args.filter((a) => !a.startsWith("--"));
const selected = (id) => onlyIds.length === 0 || onlyIds.includes(id);

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
const defaults = config.voice ?? {};

async function elevenLabs(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

function save(relPath, buffer) {
  const file = join(PUBLIC_DIR, relPath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, buffer);
  console.log(`  ✓ public/${relPath}`);
}

function shouldGenerate(relPath) {
  if (force || !existsSync(join(PUBLIC_DIR, relPath))) return true;
  console.log(`  · public/${relPath} (exists, use --force to regenerate)`);
  return false;
}

async function generateVoiceover(item) {
  const relPath = `voiceover/${item.id}.mp3`;
  if (!shouldGenerate(relPath)) return;
  const voiceId = item.voiceId ?? defaults.voiceId;
  const audio = await elevenLabs(
    `/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      text: item.text,
      model_id: item.modelId ?? defaults.modelId ?? "eleven_multilingual_v2",
      voice_settings: { ...defaults.settings, ...item.settings },
    },
  );
  save(relPath, audio);
}

async function generateSfx(item) {
  const relPath = `sfx/${item.id}.mp3`;
  if (!shouldGenerate(relPath)) return;
  const audio = await elevenLabs("/sound-generation", {
    text: item.prompt,
    duration_seconds: item.durationSeconds ?? null,
    prompt_influence: item.promptInfluence ?? 0.3,
  });
  save(relPath, audio);
}

let failed = 0;
async function run(label, items, fn) {
  const todo = (items ?? []).filter((item) => selected(item.id));
  if (todo.length === 0) return;
  console.log(`${label}:`);
  for (const item of todo) {
    try {
      await fn(item);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${item.id}: ${err.message}`);
    }
  }
}

await run("Voiceovers", config.voiceovers, generateVoiceover);
await run("Sound effects", config.sfx, generateSfx);
process.exit(failed > 0 ? 1 : 0);
