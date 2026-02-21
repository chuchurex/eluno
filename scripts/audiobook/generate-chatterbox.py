#!/usr/bin/env python3

"""
Generate audiobook MP3s using Chatterbox TTS (free, local)

Reads: audiobook/text/{lang}/chNN.txt
Writes: audiobook/audio/{lang}/chNN.mp3

Requirements:
  pip install chatterbox-tts torchaudio pydub

Usage:
  python scripts/audiobook/generate-chatterbox.py --lang en
  python scripts/audiobook/generate-chatterbox.py --lang en --only 1
  python scripts/audiobook/generate-chatterbox.py --lang pt --only 1-5
  python scripts/audiobook/generate-chatterbox.py --lang en --voice samples/narrator-en.wav
  python scripts/audiobook/generate-chatterbox.py --dry-run --lang en

Voice cloning:
  Provide a 5-10 second WAV/MP3 clip of the desired narrator voice.
  Place it in audiobook/voices/{lang}.wav (or specify with --voice)
"""

import argparse
import os
import sys
import time
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
TEXT_DIR = PROJECT_ROOT / "audiobook" / "text"
AUDIO_DIR = PROJECT_ROOT / "audiobook" / "audio"
VOICES_DIR = PROJECT_ROOT / "audiobook" / "voices"

# Language IDs supported by Chatterbox
LANG_IDS = {
    "en": "en",
    "es": "es",
    "pt": "pt",
}

MAX_CHUNK = 3000  # Chatterbox handles shorter chunks better


def split_into_chunks(text, max_size=MAX_CHUNK):
    """Split text into chunks at paragraph boundaries."""
    paragraphs = text.split("\n\n")
    chunks = []
    current = ""

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue

        if len(current) + len(para) + 2 > max_size:
            if current:
                chunks.append(current.strip())
            current = para
        else:
            current = f"{current}\n\n{para}" if current else para

    if current:
        chunks.append(current.strip())

    return chunks


def generate_chapter(model, text_path, output_path, lang, voice_path=None, dry_run=False):
    """Generate audio for a single chapter."""
    import torchaudio as ta
    import torch
    from pydub import AudioSegment

    text = text_path.read_text(encoding="utf-8")
    chunks = split_into_chunks(text)

    print(f"   📄 {len(text):,} chars, {len(chunks)} chunks")

    if dry_run:
        est_minutes = len(text.split()) / 150
        print(f"   🔍 [DRY RUN] ~{est_minutes:.0f} min estimated audio")
        return True

    audio_segments = []
    lang_id = LANG_IDS.get(lang, "en")

    for i, chunk in enumerate(chunks):
        print(f"   🔊 Chunk {i + 1}/{len(chunks)}...", end="", flush=True)

        try:
            start = time.time()
            wav = model.generate(
                chunk,
                language_id=lang_id,
                audio_prompt_path=str(voice_path) if voice_path else None,
            )
            elapsed = time.time() - start

            # Save temp WAV
            tmp_wav = output_path.with_suffix(f".chunk{i}.wav")
            ta.save(str(tmp_wav), wav, model.sr)

            # Convert to AudioSegment for concatenation
            segment = AudioSegment.from_wav(str(tmp_wav))
            audio_segments.append(segment)

            # Add a short pause between chunks
            audio_segments.append(AudioSegment.silent(duration=800))

            tmp_wav.unlink()  # cleanup temp

            print(f" ✅ ({elapsed:.1f}s)")

        except Exception as e:
            print(f" ❌ {e}")
            raise

    # Concatenate all segments
    combined = audio_segments[0]
    for seg in audio_segments[1:]:
        combined += seg

    # Export as MP3
    combined.export(str(output_path), format="mp3", bitrate="128k")

    size_mb = output_path.stat().st_size / 1024 / 1024
    duration_min = len(combined) / 1000 / 60
    print(f"   💾 Saved: {size_mb:.2f} MB ({duration_min:.1f} min)")

    return True


def main():
    parser = argparse.ArgumentParser(description="Generate audiobook with Chatterbox TTS")
    parser.add_argument("--lang", required=True, choices=["en", "es", "pt"])
    parser.add_argument("--only", help="Chapter number or range (e.g., 3 or 1-5)")
    parser.add_argument("--voice", help="Path to voice sample WAV/MP3 for cloning")
    parser.add_argument("--dry-run", action="store_true", help="Preview without generating")
    args = parser.parse_args()

    # Parse chapter range
    only = None
    start_ch, end_ch = 1, 16
    if args.only:
        if "-" in args.only:
            start_ch, end_ch = map(int, args.only.split("-"))
        else:
            only = int(args.only)

    print("\n🗣️  CHATTERBOX TTS GENERATOR (free, local)\n")

    # Find text files
    text_dir = TEXT_DIR / args.lang
    if not text_dir.exists():
        print(f"❌ No text files at {text_dir}")
        print("   Run: node scripts/audiobook/extract-text.cjs first")
        sys.exit(1)

    out_dir = AUDIO_DIR / args.lang
    out_dir.mkdir(parents=True, exist_ok=True)

    # Resolve voice sample
    voice_path = None
    if args.voice:
        voice_path = Path(args.voice)
    else:
        # Check default location
        for ext in [".wav", ".mp3"]:
            default_voice = VOICES_DIR / f"{args.lang}{ext}"
            if default_voice.exists():
                voice_path = default_voice
                break

    if voice_path:
        print(f"🎤 Voice: {voice_path}")
    else:
        print("🎤 Voice: default (no cloning)")

    # Load model (skip if dry run)
    model = None
    if not args.dry_run:
        print("📦 Loading Chatterbox model (first time downloads ~1.5GB)...")
        try:
            from chatterbox.tts import ChatterboxTTS
            import torch

            device = "mps" if torch.backends.mps.is_available() else "cpu"
            print(f"   Device: {device}")
            model = ChatterboxTTS.from_pretrained(device=device)
            print("   ✅ Model loaded\n")
        except ImportError:
            print("❌ Chatterbox not installed. Run:")
            print("   pip install chatterbox-tts torchaudio pydub")
            sys.exit(1)
        except Exception as e:
            print(f"❌ Failed to load model: {e}")
            sys.exit(1)

    # Process chapters
    files = sorted(text_dir.glob("ch*.txt"))
    success = 0
    total_start = time.time()

    for text_file in files:
        num = int(text_file.stem.replace("ch", ""))
        if only and num != only:
            continue
        if num < start_ch or num > end_ch:
            continue

        output_path = out_dir / f"ch{num:02d}.mp3"

        # Skip existing
        if output_path.exists() and output_path.stat().st_size > 10000:
            print(f"\n⏭️  ch{num:02d} already exists ({output_path.stat().st_size / 1024 / 1024:.1f} MB), skipping")
            continue

        print(f"\n📖 Chapter {num}: {text_file.name}")

        try:
            if generate_chapter(model, text_file, output_path, args.lang, voice_path, args.dry_run):
                success += 1
        except Exception as e:
            print(f"   ❌ Failed: {e}")
            print("   Continuing...")

    elapsed = (time.time() - total_start) / 60

    print(f"\n{'=' * 50}")
    print(f"✅ {success} chapters processed")
    if not args.dry_run:
        print(f"⏱️  Time: {elapsed:.1f} min")
    print(f"📁 Output: {out_dir}\n")


if __name__ == "__main__":
    main()
