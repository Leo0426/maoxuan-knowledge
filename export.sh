#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="${OUTPUT_DIR:-./images}"

# ── argument parsing ──────────────────────────────────────────────────────────
usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --output <dir>   Output directory for tar.gz files (default: ./images)"
  echo "  -h, --help       Show this help"
  echo ""
  echo "Environment variables:"
  echo "  OUTPUT_DIR       Same as --output"
  echo ""
  echo "To load images on another machine:"
  echo "  docker load -i images/maoxuan-knowledge-backend.tar.gz"
  echo "  docker load -i images/maoxuan-knowledge-frontend.tar.gz"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output) OUTPUT_DIR="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

# ── check images exist ────────────────────────────────────────────────────────
missing=()
docker image inspect maoxuan-knowledge-backend:latest  &>/dev/null || missing+=("maoxuan-knowledge-backend:latest")
docker image inspect maoxuan-knowledge-frontend:latest &>/dev/null || missing+=("maoxuan-knowledge-frontend:latest")

if [[ ${#missing[@]} -gt 0 ]]; then
  echo "ERROR: The following images were not found locally:"
  for img in "${missing[@]}"; do
    echo "  - $img"
  done
  echo ""
  echo "Run ./build.sh first."
  exit 1
fi

mkdir -p "$OUTPUT_DIR"
echo "▶ Output directory: $OUTPUT_DIR"
echo ""

# ── export ────────────────────────────────────────────────────────────────────
export_image() {
  local image="$1"
  local filename="$2"
  local dest="$OUTPUT_DIR/$filename"
  echo -n "Exporting $image → $dest ... "
  docker save "$image" | gzip > "$dest"
  local size
  size=$(du -sh "$dest" | cut -f1)
  echo "$size"
}

export_image maoxuan-knowledge-backend:latest  maoxuan-knowledge-backend.tar.gz
export_image maoxuan-knowledge-frontend:latest maoxuan-knowledge-frontend.tar.gz

echo ""
echo "✓ Export complete."
echo ""
echo "To load on another machine:"
echo "  docker load -i $OUTPUT_DIR/maoxuan-knowledge-backend.tar.gz"
echo "  docker load -i $OUTPUT_DIR/maoxuan-knowledge-frontend.tar.gz"
