"""Generate the 8 teaser SFX with the ElevenLabs Sound Effects API.

    export ELEVENLABS_API_KEY=...
    python3 sfx_elevenlabs.py            # writes sfx/elevenlabs/<name>.mp3
    python3 mix_audio.py --source elevenlabs && ./build.sh --mux-only

mix_audio.py trims leading silence, caps each effect at 1.0 s (stinger 1.2 s)
and aligns its onset/peak to the frame listed in cues.json.
"""
import json
import os
import sys
import urllib.request
from pathlib import Path

OUT = Path(__file__).parent / "sfx" / "elevenlabs"
API = "https://api.elevenlabs.io/v1/sound-generation"

# name -> (prompt, requested duration in seconds; the API minimum is 0.5 s)
PROMPTS = {
    "whoosh": ("Short dry fast whoosh, quick air swipe as a UI card flies in, clean, no reverb, no music", 0.5),
    "pop": ("Deep punchy low pop impact, a UI card landing with an elastic bounce, heavy thump, dry, no music", 0.5),
    "click": ("Single clean crisp UI mouse click, dry, minimal, short tap, no reverb", 0.5),
    "beep": ("Short tense alert beep, two quick subtle warning tones, UI notification, dry", 0.5),
    "swoosh": ("Zoom out swoosh, smooth air whoosh receding into the distance, short, clean", 0.7),
    "ding": ("Clean bright positive ding, single bell chime, success notification, short and crisp", 0.8),
    "stinger": ("Short brand logo stinger, deep punchy stamp impact with body and low end, confirmation seal, no melody, no music", 1.2),
    "click_final": ("Soft gentle quiet UI click, subtle tap, dry, minimal", 0.5),
}


def generate(name, prompt, duration, key):
    body = json.dumps({"text": prompt, "duration_seconds": duration, "prompt_influence": 0.7}).encode()
    req = urllib.request.Request(API, data=body, method="POST", headers={
        "xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg",
    })
    with urllib.request.urlopen(req, timeout=120) as r:
        (OUT / f"{name}.mp3").write_bytes(r.read())


if __name__ == "__main__":
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("Set ELEVENLABS_API_KEY first.")
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:] or list(PROMPTS)
    for name in only:
        prompt, dur = PROMPTS[name]
        print(f"generating {name} ({dur}s)...")
        generate(name, prompt, dur, key)
    print("done ->", OUT)
