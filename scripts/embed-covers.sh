#!/bin/bash

# =============================================================================
# EMBED COVERS INTO MP3 FILES
# =============================================================================
#
# This script embeds cover images into MP3 files using ffmpeg.
# Run after generate-covers.js to add artwork to the audiobook files.
#
# USAGE:
#   chmod +x scripts/embed-covers.sh
#   ./scripts/embed-covers.sh
#
# =============================================================================

AUDIO_DIR="/Users/chuchurex/Sites/prod/eluno.org/video/dist/audio"
COVERS_DIR="/Users/chuchurex/Sites/prod/eluno.org/assets/covers/mp3"
TEMP_DIR="/Users/chuchurex/Sites/prod/eluno.org/video/dist/audio/temp"

# Create temp directory
mkdir -p "$TEMP_DIR"

echo "🎵 Embedding cover art into MP3 files..."
echo ""

# Mapping: episode number -> cover number
# ep01 = cover-01, ep02 = cover-02, etc.
for i in $(seq -w 1 16); do
  # Find the MP3 file for this episode
  MP3_FILE=$(ls "$AUDIO_DIR"/ep${i}-*.mp3 2>/dev/null | head -1)
  COVER_FILE="$COVERS_DIR/cover-${i}-es.png"

  if [ -f "$MP3_FILE" ] && [ -f "$COVER_FILE" ]; then
    FILENAME=$(basename "$MP3_FILE")
    TEMP_FILE="$TEMP_DIR/$FILENAME"

    echo "  Processing: $FILENAME"

    # Use ffmpeg to embed the cover art
    ffmpeg -i "$MP3_FILE" -i "$COVER_FILE" \
      -map 0:a -map 1:0 \
      -c:a copy \
      -id3v2_version 3 \
      -metadata:s:v title="Album cover" \
      -metadata:s:v comment="Cover (front)" \
      "$TEMP_FILE" -y -loglevel error

    if [ $? -eq 0 ]; then
      # Replace original with new file
      mv "$TEMP_FILE" "$MP3_FILE"
      echo "    ✓ Cover embedded successfully"
    else
      echo "    ✗ Error embedding cover"
    fi
  else
    echo "  ⚠ Skipping ep${i}: MP3 or cover not found"
  fi
done

# Clean up temp directory
rmdir "$TEMP_DIR" 2>/dev/null

echo ""
echo "✅ Done! Cover art embedded into all MP3 files."
