#!/usr/bin/env bash
# Copies bundled Cursor asset PNGs into public/ so profile + On Repeat match your provided art.
# Safe to re-run any time you replace the sources under ~/.cursor/projects/.../assets/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC_DIR="${SPOTIFY_A11Y_ASSET_SRC:-$HOME/.cursor/projects/Users-aninya-Documents-Cursor/assets}"
mkdir -p "$ROOT/public/axis" "$ROOT/public/home"
cp "$SRC_DIR/about-headshot-66729238-43f1-4537-ae34-a709f967e8b7.png" "$ROOT/public/axis/avatar-profile.png"
cp "$SRC_DIR/image-2607f84d-8ea9-4665-ab82-4377ba1fd923.png" "$ROOT/public/home/tile-02.png"
echo "Copied profile → public/axis/avatar-profile.png"
echo "Copied On Repeat → public/home/tile-02.png"
