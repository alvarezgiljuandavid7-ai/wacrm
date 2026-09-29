"""Procedural synthesis of the 8 teaser SFX (fallback when ElevenLabs is unavailable).

Writes 48 kHz mono 16-bit WAVs to sfx/synth/<name>.wav:
whoosh, pop, click, beep, swoosh, ding, stinger, click_final
"""
import math
import wave
from pathlib import Path

import numpy as np

SR = 48000
OUT = Path(__file__).parent / "sfx" / "synth"
rng = np.random.default_rng(7)


def t_axis(dur):
    return np.arange(int(dur * SR)) / SR


def svf(x, cutoff, q=0.9, mode="bp"):
    """Chamberlin state-variable filter; cutoff may be an array (time-varying sweep)."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    f = 2 * np.sin(np.pi * np.minimum(cutoff, SR / 6) / SR)
    damp = 1.0 / q
    lp = bp = 0.0
    out = np.empty_like(x)
    for i, v in enumerate(x):
        hp = v - lp - damp * bp
        bp += f[i] * hp
        lp += f[i] * bp
        out[i] = bp if mode == "bp" else lp if mode == "lp" else hp
    return out


def log_sweep(t, dur, f0, f1):
    return f0 * (f1 / f0) ** np.clip(t / dur, 0, 1)


def phase_sine(freq):
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def env_ad(t, attack, tau):
    a = np.clip(t / max(attack, 1e-6), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / tau)


def fade_out(x, ms=12):
    n = min(len(x), int(ms * SR / 1000))
    x[-n:] *= np.linspace(1, 0, n) ** 2
    return x


def reverb(x, length=0.5, decay=0.12, mix=0.15):
    ir_t = t_axis(length)
    ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t / decay)
    ir = svf(ir, 3500, 0.7, "lp")
    ir /= np.sqrt(np.sum(ir ** 2))
    wet = np.convolve(x, ir)
    dry = np.concatenate([x, np.zeros(len(wet) - len(x))])
    return dry + mix * wet


def normalize(x, peak_db=-1.0):
    return x / (np.max(np.abs(x)) + 1e-9) * 10 ** (peak_db / 20)


# ---------------------------------------------------------------- sounds
def whoosh():
    dur = 0.42
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    peak = 0.26
    cut = np.where(t < peak, log_sweep(t, peak, 450, 3800), log_sweep(t - peak, dur - peak, 3800, 900))
    body = svf(n, cut, 1.6, "bp") + 0.35 * svf(n, cut * 0.4, 0.8, "lp")
    env = np.where(t < peak, (t / peak) ** 2.6, np.exp(-(t - peak) / 0.045))
    return fade_out(body * env)


def pop():
    dur = 0.34
    t = t_axis(dur)
    freq = 55 + (230 - 55) * np.exp(-t / 0.035)
    tone = phase_sine(freq) + 0.25 * phase_sine(freq * 2)
    tone *= env_ad(t, 0.002, 0.085)
    trans = svf(rng.standard_normal(len(t)), 1800, 0.8, "lp") * env_ad(t, 0.0005, 0.004) * 1.6
    x = np.tanh(2.2 * (tone + trans)) / np.tanh(2.2)
    return fade_out(x)


def click(freq=2300, tick_tau=0.010, noise_bp=4200, soft=False):
    dur = 0.09 if not soft else 0.12
    t = t_axis(dur)
    tick = phase_sine(np.full(len(t), freq)) * env_ad(t, 0.0003, tick_tau)
    body = phase_sine(np.full(len(t), freq * 0.27)) * env_ad(t, 0.0005, 0.006) * 0.6
    nz = svf(rng.standard_normal(len(t)), noise_bp, 1.2, "bp") * env_ad(t, 0.0002, 0.0025) * 1.4
    x = tick + body + nz
    if soft:
        x = svf(x, 2600, 0.7, "lp")
    return fade_out(x, 8)


def beep():
    dur = 0.36
    t = t_axis(dur)
    x = np.zeros(len(t))
    for start in (0.0, 0.14):
        tt = t - start
        on = (tt >= 0) & (tt < 0.1)
        g = np.clip(tt / 0.003, 0, 1) * np.clip((0.1 - tt) / 0.02, 0, 1) * on
        for f in (1480.0, 1568.0):  # minor second -> tense
            for h, a in ((1, 1.0), (3, 0.22), (5, 0.08)):
                x += a * np.sin(2 * np.pi * f * h * tt) * g
    return fade_out(svf(x, 6000, 0.7, "lp"))


def swoosh():
    dur = 0.68
    t = t_axis(dur)
    n = rng.standard_normal(len(t))
    peak = 0.2
    cut = np.where(t < peak, log_sweep(t, peak, 1200, 3200), log_sweep(t - peak, dur - peak, 3200, 220))
    body = svf(n, cut, 1.3, "bp")
    env = np.where(t < peak, (t / peak) ** 2.0, np.exp(-(t - peak) / 0.14))
    tone = phase_sine(log_sweep(t, dur, 520, 130)) * env * 0.18
    return fade_out(body * env + tone, 30)


def ding():
    dur = 0.8
    t = t_axis(dur)
    f = 1318.5  # E6
    x = np.zeros(len(t))
    for ratio, amp, tau in ((1, 1.0, 0.32), (1.004, 0.5, 0.3), (2.0, 0.35, 0.18), (2.76, 0.18, 0.11), (5.4, 0.07, 0.05)):
        x += amp * np.sin(2 * np.pi * f * ratio * t) * env_ad(t, 0.0015, tau)
    x += svf(rng.standard_normal(len(t)), 6000, 1, "bp") * env_ad(t, 0.0003, 0.002) * 0.4
    return fade_out(reverb(x, 0.4, 0.1, 0.12)[: len(t)], 40)


def stinger():
    dur = 1.15
    t = t_axis(dur)
    sub_f = 46 + (115 - 46) * np.exp(-t / 0.06)
    sub = phase_sine(sub_f) * env_ad(t, 0.002, 0.32)
    thump = svf(rng.standard_normal(len(t)), 900, 0.7, "lp") * env_ad(t, 0.0008, 0.035) * 2.2
    stamp = svf(rng.standard_normal(len(t)), 2800, 1.5, "bp") * env_ad(t, 0.0003, 0.006) * 1.2
    chord = np.zeros(len(t))
    for f, a in ((110.0, 1.0), (164.81, 0.7), (220.0, 0.55), (329.63, 0.25)):
        for h in range(1, 9):  # band-limited saw
            chord += a * np.sin(2 * np.pi * f * h * t) / h
    chord = svf(chord, 250 + 2400 * np.exp(-t / 0.09), 1.1, "lp") * env_ad(t, 0.004, 0.3) * 0.5
    x = np.tanh(1.6 * (sub * 1.2 + thump + stamp + chord)) / np.tanh(1.6)
    x = reverb(x, 0.7, 0.16, 0.2)[: len(t)]
    return fade_out(x, 120)


def click_final():
    return click(freq=1450, tick_tau=0.014, noise_bp=2600, soft=True)


SOUNDS = {
    "whoosh": whoosh,
    "pop": pop,
    "click": click,
    "beep": beep,
    "swoosh": swoosh,
    "ding": ding,
    "stinger": stinger,
    "click_final": click_final,
}


def write_wav(path, x):
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in SOUNDS.items():
        x = normalize(fn())
        write_wav(OUT / f"{name}.wav", x)
        print(f"{name:12s} {len(x) / SR:.3f}s")
