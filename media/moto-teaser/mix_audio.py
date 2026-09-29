"""Mix the SFX into an 18 s stereo track, frame-synced to cues.json.

    python3 mix_audio.py [--source synth|elevenlabs]   -> out/sfx_mix.wav

Each cue places its effect so that its onset (or loudness peak, for whooshes)
lands exactly on the cue frame. Missing ElevenLabs files fall back to synth.
"""
import argparse
import json
import os
import subprocess
import wave
from pathlib import Path

import numpy as np

HERE = Path(__file__).parent
SR = 48000
MAX_DUR = {"stinger": 1.2}  # every other effect is capped at 1.0 s


def ffmpeg_bin():
    if os.environ.get("FFMPEG"):
        return os.environ["FFMPEG"]
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        return "ffmpeg"


def load(path):
    raw = subprocess.run([ffmpeg_bin(), "-loglevel", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype="<f4").astype(float)


def envelope(x, ms=5):
    n = max(1, int(ms * SR / 1000))
    return np.sqrt(np.convolve(x ** 2, np.ones(n) / n, mode="same"))


def prepare(x, name):
    """Trim leading silence, cap duration, return (samples, onset_idx, peak_idx)."""
    env = envelope(x)
    onset = int(np.argmax(env > 0.08 * env.max()))
    start = max(0, onset - int(0.004 * SR))
    x = x[start:start + int(MAX_DUR.get(name, 1.0) * SR)].copy()
    fade = int(0.02 * SR)
    if len(x) > fade:
        x[-fade:] *= np.linspace(1, 0, fade)
    env = envelope(x, 15)
    return x, onset - start, int(np.argmax(env))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", default="synth", choices=["synth", "elevenlabs"])
    args = ap.parse_args()
    cfg = json.loads((HERE / "cues.json").read_text())
    fps, total = cfg["fps"], cfg["durationFrames"] / cfg["fps"]
    n = int(round(total * SR))
    mix = np.zeros((n, 2))

    cache = {}
    for cue in cfg["cues"]:
        name = cue["sfx"]
        if name not in cache:
            el = HERE / "sfx" / "elevenlabs" / f"{name}.mp3"
            path = el if args.source == "elevenlabs" and el.exists() else HERE / "sfx" / "synth" / f"{name}.wav"
            x = load(path)
            x /= np.max(np.abs(x)) + 1e-9
            cache[name] = (*prepare(x, name), path.name)
        x, onset, peak = cache[name][:3]
        anchor = peak if cue.get("align") == "peak" else onset
        pos = int(round(cue["frame"] / fps * SR)) - anchor
        g = 10 ** (cue.get("gainDb", 0) / 20)
        pan = cue.get("pan", 0.0)
        lr = np.array([np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)]) * np.sqrt(2)
        a, b = max(pos, 0), min(pos + len(x), n)
        mix[a:b] += np.outer(x[a - pos:b - pos] * g, lr)
        print(f"{cue['id']:12s} frame {cue['frame']:3d}  t={cue['frame'] / fps:6.3f}s  {cache[name][3]}  ({len(x) / SR:.2f}s)")

    peak = np.max(np.abs(mix))
    ceiling = 10 ** (-1.0 / 20)
    if peak > ceiling:
        mix *= ceiling / peak
    out = HERE / "out" / "sfx_mix.wav"
    out.parent.mkdir(exist_ok=True)
    dither = (np.random.default_rng(1).random(mix.shape) - np.random.default_rng(2).random(mix.shape)) / 32768
    pcm = (np.clip(mix + dither, -1, 1) * 32767).astype("<i2")
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"wrote {out} ({n / SR:.3f}s, peak {20 * np.log10(max(peak, 1e-9)):.1f} dBFS pre-limit)")


if __name__ == "__main__":
    main()
