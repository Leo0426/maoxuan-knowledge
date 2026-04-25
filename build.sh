#!/usr/bin/env bash
set -euo pipefail

# ── defaults ──────────────────────────────────────────────────────────────────
BUILDER_NAME="maoxuan-builder"
VITE_API_BASE_URL="${VITE_API_BASE_URL:-}"

# Detect host architecture and map to Docker platform
case "$(uname -m)" in
  arm64|aarch64) DEFAULT_PLATFORM="linux/arm64" ;;
  x86_64|amd64)  DEFAULT_PLATFORM="linux/amd64"  ;;
  *)              DEFAULT_PLATFORM="linux/amd64"  ;;
esac
PLATFORM="${PLATFORM:-$DEFAULT_PLATFORM}"

# ── argument parsing ──────────────────────────────────────────────────────────
usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --platform <platform>   Target platform (default: auto-detected)"
  echo "                          e.g. linux/amd64, linux/arm64, linux/amd64,linux/arm64"
  echo "  --api-url <url>         Value for VITE_API_BASE_URL build arg"
  echo "  -h, --help              Show this help"
  echo ""
  echo "Environment variables:"
  echo "  PLATFORM                Same as --platform"
  echo "  VITE_API_BASE_URL       Same as --api-url"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --platform)   PLATFORM="$2";          shift 2 ;;
    --api-url)    VITE_API_BASE_URL="$2"; shift 2 ;;
    -h|--help)    usage; exit 0 ;;
    *) echo "Unknown option: $1"; usage; exit 1 ;;
  esac
done

# ── multi-platform guard ──────────────────────────────────────────────────────
# Building for multiple platforms simultaneously requires pushing to a registry
# because `--load` only supports a single platform. Warn the user.
if [[ "$PLATFORM" == *","* ]]; then
  echo "WARNING: Multi-platform builds cannot be loaded into the local Docker daemon."
  echo "  Use a single platform (e.g. --platform linux/amd64) for local use."
  echo "  For multi-platform, add --push and a registry target."
  exit 1
fi

echo "▶ Platform : $PLATFORM"
echo "▶ API URL  : ${VITE_API_BASE_URL:-(empty)}"
echo ""

# ── ensure buildx builder ─────────────────────────────────────────────────────
if ! docker buildx inspect "$BUILDER_NAME" &>/dev/null; then
  echo "Creating buildx builder '$BUILDER_NAME'..."
  docker buildx create --name "$BUILDER_NAME" --use --bootstrap
else
  docker buildx use "$BUILDER_NAME"
fi

# ── build backend ─────────────────────────────────────────────────────────────
echo "Building maoxuan-knowledge-backend:latest ..."
docker buildx build \
  --platform "$PLATFORM" \
  --load \
  --tag maoxuan-knowledge-backend:latest \
  --file backend/Dockerfile \
  .

# ── build frontend ────────────────────────────────────────────────────────────
echo ""
echo "Building maoxuan-knowledge-frontend:latest ..."
docker buildx build \
  --platform "$PLATFORM" \
  --load \
  --tag maoxuan-knowledge-frontend:latest \
  --build-arg VITE_API_BASE_URL="$VITE_API_BASE_URL" \
  --file frontend/Dockerfile \
  .

echo ""
echo "✓ Build complete."
