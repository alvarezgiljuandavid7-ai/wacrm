#!/usr/bin/env bash
# Full build: SFX -> frame render -> audio mix -> final MP4.
#   ./build.sh                          synth SFX (default)
#   SFX_SOURCE=elevenlabs ./build.sh    use sfx/elevenlabs/*.mp3 (run sfx_elevenlabs.py first)
#   CHANNEL_NAME="Mi Canal" ./build.sh  set the brand name shown in scene 4
#   ./build.sh --mux-only               re-mix audio and re-mux without re-rendering video
set -euo pipefail
cd "$(dirname "$0")"
FFMPEG="${FFMPEG:-$(python3 -c 'import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())' 2>/dev/null || echo ffmpeg)}"
export FFMPEG

if [[ "${1:-}" != "--mux-only" ]]; then
  python3 sfx_synth.py
  node render.mjs
fi
python3 mix_audio.py --source "${SFX_SOURCE:-synth}"

"$FFMPEG" -y -loglevel error -i out/video_noaudio.mp4 -i out/sfx_mix.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -ar 48000 -t 18 -movflags +faststart \
  out/moto_teaser_1080x1920.mp4
echo "wrote out/moto_teaser_1080x1920.mp4"
