#!/usr/bin/env python3
"""Build JamBeacon's original loop pack from CC0 Sonic Pi one-shots."""

from __future__ import annotations

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from scipy.io import wavfile


SR = 44_100


@dataclass(frozen=True)
class LoopSpec:
    slug: str
    name: str
    bpm: int
    bars: int
    meter: str
    kit: str
    style: str


SPECS = [
    LoopSpec("texas-thunder-120bpm", "Texas Thunder", 120, 8, "4/4", "rock", "rock"),
    LoopSpec("lone-star-shuffle-105bpm", "Lone Star Shuffle", 105, 4, "4/4", "rock", "shuffle"),
    LoopSpec("funk-highway-102bpm", "Funk Highway", 102, 4, "4/4", "tight", "funk"),
    LoopSpec("garage-stomp-128bpm", "Garage Stomp", 128, 4, "4/4", "rock", "stomp"),
    LoopSpec("midnight-pocket-92bpm", "Midnight Pocket", 92, 4, "4/4", "electro", "hiphop"),
    LoopSpec("arena-drive-135bpm", "Arena Drive", 135, 4, "4/4", "rock", "arena"),
    LoopSpec("blues-six-84bpm", "Blues Six", 84, 4, "6/8", "brush", "six"),
    LoopSpec("southern-halftime-76bpm", "Southern Half-Time", 76, 4, "4/4", "electro", "halftime"),
    LoopSpec("neon-punk-172bpm", "Neon Punk", 172, 4, "4/4", "rock", "punk"),
    LoopSpec("heavy-crown-145bpm", "Heavy Crown", 145, 4, "4/4", "heavy", "metal"),
    LoopSpec("desert-reggae-88bpm", "Desert Reggae", 88, 4, "4/4", "tight", "reggae"),
    LoopSpec("breakbeat-chase-110bpm", "Breakbeat Chase", 110, 4, "4/4", "electro", "breakbeat"),
]


KITS = {
    "rock": {
        "kick": "drum_heavy_kick.flac", "snare": "drum_snare_hard.flac",
        "hat": "drum_cymbal_closed.flac", "open": "drum_cymbal_open.flac",
        "crash": "drum_cymbal_hard.flac", "tom_hi": "drum_tom_hi_hard.flac",
        "tom_mid": "drum_tom_mid_hard.flac", "tom_lo": "drum_tom_lo_hard.flac",
    },
    "tight": {
        "kick": "bd_fat.flac", "snare": "sn_generic.flac", "hat": "hat_snap.flac",
        "open": "hat_zild.flac", "crash": "drum_splash_hard.flac",
        "tom_hi": "drum_tom_hi_soft.flac", "tom_mid": "drum_tom_mid_soft.flac",
        "tom_lo": "drum_tom_lo_soft.flac",
    },
    "electro": {
        "kick": "bd_haus.flac", "snare": "sn_dub.flac", "hat": "hat_zap.flac",
        "open": "hat_noiz.flac", "crash": "elec_cymbal.flac",
        "tom_hi": "elec_fuzz_tom.flac", "tom_mid": "elec_lo_snare.flac",
        "tom_lo": "bd_808.flac",
    },
    "brush": {
        "kick": "bd_jazz.flac", "snare": "drum_snare_soft.flac", "hat": "ride_via.flac",
        "open": "ride_tri.flac", "crash": "drum_cymbal_soft.flac",
        "tom_hi": "drum_tom_hi_soft.flac", "tom_mid": "drum_tom_mid_soft.flac",
        "tom_lo": "drum_tom_lo_soft.flac",
    },
    "heavy": {
        "kick": "bd_boom.flac", "snare": "sn_zome.flac", "hat": "hat_metal.flac",
        "open": "drum_cymbal_open.flac", "crash": "drum_splash_hard.flac",
        "tom_hi": "drum_tom_hi_hard.flac", "tom_mid": "drum_tom_mid_hard.flac",
        "tom_lo": "drum_tom_lo_hard.flac",
    },
}


def decode_flac(path: Path) -> np.ndarray:
    command = [
        "ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1",
        "-ar", str(SR), "pipe:1",
    ]
    raw = subprocess.check_output(command)
    audio = np.frombuffer(raw, dtype="<f4").copy()
    peak = float(np.max(np.abs(audio))) if audio.size else 1.0
    if peak > 0:
        audio /= peak
    return audio


def event(pattern: list[tuple[str, float, float, float]], sound: str, beat: float, velocity: float = 1.0, pan: float = 0.0) -> None:
    pattern.append((sound, beat, velocity, pan))


def four_four_pattern(spec: LoopSpec) -> list[tuple[str, float, float, float]]:
    p: list[tuple[str, float, float, float]] = []
    for bar in range(spec.bars):
        base = bar * 4.0
        final = bar == spec.bars - 1
        if bar == 0:
            event(p, "crash", base, .72)

        if spec.style == "rock":
            kicks = [0, 1.5, 2, 3.25] if bar % 2 == 0 else [0, .75, 2, 2.75, 3.5]
            snares = [1, 3]
            hats = np.arange(0, 4, .5)
        elif spec.style == "shuffle":
            kicks, snares, hats = [0, 1.5, 2.67, 3.33], [1.33, 3.33], np.arange(0, 4, 2/3)
        elif spec.style == "funk":
            kicks, snares, hats = [0, .75, 1.75, 2.5, 3.25], [1, 3], np.arange(0, 4, .25)
        elif spec.style == "stomp":
            kicks, snares, hats = [0, 1, 2, 3], [1, 3], np.arange(0, 4, .5)
        elif spec.style == "hiphop":
            kicks, snares, hats = [0, .75, 2.25, 3.5], [1, 3], np.arange(0, 4, .5)
        elif spec.style == "arena":
            kicks, snares, hats = [0, .5, 2, 2.5, 3.5], [1, 3], np.arange(0, 4, .5)
        elif spec.style == "halftime":
            kicks, snares, hats = [0, .75, 1.75, 2.5, 3.25], [2], np.arange(0, 4, .25)
        elif spec.style == "punk":
            kicks, snares, hats = [0, .5, 2, 2.5], [1, 3], np.arange(0, 4, .25)
        elif spec.style == "metal":
            kicks, snares, hats = [0, .25, .75, 1.5, 2, 2.25, 2.75, 3.5], [1, 3], np.arange(0, 4, .25)
        elif spec.style == "reggae":
            kicks, snares, hats = [0, 2.5], [2], np.arange(.5, 4, .5)
        else:  # breakbeat
            kicks, snares, hats = [0, .75, 2.25, 2.75, 3.5], [1, 2.75], np.arange(0, 4, .25)

        for idx, beat in enumerate(kicks):
            event(p, "kick", base + float(beat), .9 if idx == 0 else .76)
        for beat in snares:
            event(p, "snare", base + float(beat), .88)
        for idx, beat in enumerate(hats):
            accent = .55 if idx % 4 == 0 else (.38 if idx % 2 == 0 else .28)
            event(p, "hat", base + float(beat), accent, -.16 if idx % 2 == 0 else .16)

        if spec.style in {"funk", "hiphop", "halftime", "breakbeat"}:
            event(p, "snare", base + 2.75, .22, .12)
        if spec.style in {"rock", "arena", "punk", "metal"} and bar % 2 == 1:
            event(p, "open", base + 3.5, .42, .18)
        if final:
            event(p, "tom_hi", base + 3.0, .56, -.2)
            event(p, "tom_mid", base + 3.25, .62, 0)
            event(p, "tom_lo", base + 3.5, .72, .2)
            event(p, "snare", base + 3.75, .82)
    return p


def six_eight_pattern(spec: LoopSpec) -> list[tuple[str, float, float, float]]:
    p: list[tuple[str, float, float, float]] = []
    for bar in range(spec.bars):
        base = bar * 3.0
        if bar == 0:
            event(p, "crash", base, .55)
        for beat in [0, 1.5, 2.5]:
            event(p, "kick", base + beat, .82 if beat == 0 else .64)
        event(p, "snare", base + 1.5, .72)
        for idx, beat in enumerate(np.arange(0, 3, .5)):
            event(p, "hat", base + float(beat), .46 if idx in {0, 3} else .28, -.12 if idx % 2 == 0 else .12)
        if bar == spec.bars - 1:
            event(p, "tom_hi", base + 2.0, .48, -.2)
            event(p, "tom_mid", base + 2.25, .56)
            event(p, "tom_lo", base + 2.5, .66, .2)
    return p


def build_loop(spec: LoopSpec, sample_root: Path, output_root: Path) -> None:
    rng = np.random.default_rng(abs(hash(spec.slug)) % (2**32))
    kit_paths = KITS[spec.kit]
    samples = {name: decode_flac(sample_root / filename) for name, filename in kit_paths.items()}
    quarter_beats = spec.bars * (4 if spec.meter == "4/4" else 3)
    seconds = quarter_beats * 60 / spec.bpm
    frames = int(seconds * SR)
    mix = np.zeros((frames, 2), dtype=np.float32)
    pattern = four_four_pattern(spec) if spec.meter == "4/4" else six_eight_pattern(spec)

    for sound, beat, velocity, pan in pattern:
        jitter = rng.uniform(-.0045, .0045)
        start = max(0, int((beat * 60 / spec.bpm + jitter) * SR))
        sample = samples[sound]
        end = min(frames, start + sample.size)
        if end <= start:
            continue
        gain = velocity * rng.uniform(.94, 1.04)
        left = np.sqrt((1 - pan) * .5) * gain
        right = np.sqrt((1 + pan) * .5) * gain
        segment = sample[: end - start]
        mix[start:end, 0] += segment * left
        mix[start:end, 1] += segment * right

    # Parallel-style saturation and gentle room reflection.
    wet = np.zeros_like(mix)
    for delay, gain in [(0.032, .08), (0.061, .055), (0.097, .035)]:
        offset = int(delay * SR)
        wet[offset:] += mix[:-offset] * gain
    mix = np.tanh((mix + wet) * 1.12)
    fade = min(int(.018 * SR), frames // 12)
    mix[-fade:] *= np.linspace(1, 0, fade, dtype=np.float32)[:, None]
    peak = float(np.max(np.abs(mix))) or 1.0
    mix *= .91 / peak

    output_root.mkdir(parents=True, exist_ok=True)
    destination = output_root / f"{spec.slug}.mp3"
    with tempfile.TemporaryDirectory() as temp_dir:
        wav_path = Path(temp_dir) / f"{spec.slug}.wav"
        wavfile.write(wav_path, SR, np.int16(np.clip(mix, -1, 1) * 32767))
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", str(wav_path), "-codec:a", "libmp3lame",
            "-b:a", "160k", "-ar", str(SR), "-ac", "2", str(destination),
        ], check=True)
    print(f"{spec.name}: {destination.name} ({seconds:.1f}s)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    for spec in SPECS:
        build_loop(spec, args.samples, args.output)


if __name__ == "__main__":
    main()
