#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPSTREAM="$ROOT/vendor/cartographer"
TARGET="$ROOT/workspace"
if [[ ! -f "$UPSTREAM/LICENSE" ]]; then echo 'Submódulo no inicializado. Ejecuta git submodule update --init --recursive'; exit 1; fi
if [[ -d "$TARGET" ]]; then echo 'Ya existe workspace. No se sobrescribe.'; exit 1; fi
cp -R "$UPSTREAM" "$TARGET"
rm -rf "$TARGET/.git"
python3 "$ROOT/scripts/patch_voice.py" "$TARGET/src/components/chat/ChatOverlay.tsx"
echo 'Preparado. Ejecuta: cd neural-cartographer/workspace && npm ci && npm run dev'
