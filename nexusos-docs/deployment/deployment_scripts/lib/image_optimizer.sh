#!/usr/bin/env bash
#
# NexusOS Documentation Platform - Image Optimizer
# Optimizes images for web deployment
#

set -euo pipefail

# Configuration
IMAGE_QUALITY="${IMAGE_QUALITY:-85}"
MAX_WIDTH="${MAX_WIDTH:-1920}"
MAX_HEIGHT="${MAX_HEIGHT:-1080}"
VERBOSE="${VERBOSE:-false}"

# Usage
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] <input_dir> <output_dir>

Optimize images in documentation for web deployment.

OPTIONS:
  -h, --help               Show this help message
  -v, --verbose            Enable verbose output
  -q, --quality PERCENT    JPEG quality (default: 85)
  -w, --max-width PIXELS   Maximum width (default: 1920)
  -H, --max-height PIXELS  Maximum height (default: 1080)

EXAMPLES:
  # Optimize all images in docs/
  $(basename "$0") docs/ dist/optimized/

  # Optimize with specific quality
  $(basename "$0") --quality 90 docs/ dist/optimized/

EOF
  exit 0
}

# Logging
log_info() {
  echo "ℹ️  $1" >&2
}

log_success() {
  echo "✅ $1" >&2
}

log_error() {
  echo "❌ $1" >&2
}

# Check dependencies
check_dependencies() {
  local missing=()

  if ! command -v convert >/dev/null 2>&1; then
    missing+=("ImageMagick (convert)")
  fi

  if ! command -v pngquant >/dev/null 2>&1; then
    log_info "pngquant not found (optional, for better PNG compression)"
  fi

  if ! command -v optipng >/dev/null 2>&1; then
    log_info "optipng not found (optional, for better PNG optimization)"
  fi

  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "Missing required dependencies: ${missing[*]}"
    log_error "Install ImageMagick: brew install imagemagick (macOS) or apt-get install imagemagick (Ubuntu)"
    exit 1
  fi
}

# Optimize JPEG
optimize_jpeg() {
  local input="$1"
  local output="$2"

  if [[ "$VERBOSE" == "true" ]]; then
    log_info "Optimizing JPEG: $input"
  fi

  convert "$input" \
    -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
    -quality "$IMAGE_QUALITY" \
    -strip \
    "$output"
}

# Optimize PNG
optimize_png() {
  local input="$1"
  local output="$2"

  if [[ "$VERBOSE" == "true" ]]; then
    log_info "Optimizing PNG: $input"
  fi

  # Resize with ImageMagick
  convert "$input" \
    -resize "${MAX_WIDTH}x${MAX_HEIGHT}>" \
    -strip \
    "$output"

  # Further optimize with pngquant if available
  if command -v pngquant >/dev/null 2>&1; then
    pngquant --force --output "$output" "$output" 2>/dev/null || true
  fi

  # Optimize with optipng if available
  if command -v optipng >/dev/null 2>&1; then
    optipng -quiet -o2 "$output" 2>/dev/null || true
  fi
}

# Optimize SVG
optimize_svg() {
  local input="$1"
  local output="$2"

  if [[ "$VERBOSE" == "true" ]]; then
    log_info "Copying SVG: $input"
  fi

  # SVG optimization requires svgo, which is Node.js based
  # For now, just copy the file
  cp "$input" "$output"

  # If svgo is available, optimize
  if command -v svgo >/dev/null 2>&1; then
    svgo --quiet "$output" 2>/dev/null || true
  fi
}

# Process single image
process_image() {
  local input="$1"
  local output="$2"
  local ext="${input##*.}"

  mkdir -p "$(dirname "$output")"

  case "${ext,,}" in
    jpg|jpeg)
      optimize_jpeg "$input" "$output"
      ;;
    png)
      optimize_png "$input" "$output"
      ;;
    svg)
      optimize_svg "$input" "$output"
      ;;
    gif)
      # GIF optimization is complex, just copy
      cp "$input" "$output"
      ;;
    *)
      log_info "Skipping unsupported format: $ext"
      return
      ;;
  esac

  if [[ "$VERBOSE" == "true" ]]; then
    local input_size=$(du -h "$input" | cut -f1)
    local output_size=$(du -h "$output" | cut -f1)
    log_success "Optimized: $input ($input_size → $output_size)"
  fi
}

# Main function
main() {
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -h|--help) usage ;;
      -v|--verbose) VERBOSE=true; shift ;;
      -q|--quality) IMAGE_QUALITY="$2"; shift 2 ;;
      -w|--max-width) MAX_WIDTH="$2"; shift 2 ;;
      -H|--max-height) MAX_HEIGHT="$2"; shift 2 ;;
      -*)
        log_error "Unknown option: $1"
        usage
        ;;
      *)
        break
        ;;
    esac
  done

  if [[ $# -lt 2 ]]; then
    log_error "Missing required arguments"
    usage
  fi

  local input_dir="$1"
  local output_dir="$2"

  if [[ ! -d "$input_dir" ]]; then
    log_error "Input directory not found: $input_dir"
    exit 1
  fi

  log_info "Checking dependencies..."
  check_dependencies

  log_info "Optimizing images..."
  log_info "Quality: $IMAGE_QUALITY%"
  log_info "Max dimensions: ${MAX_WIDTH}x${MAX_HEIGHT}"

  # Find and process all images
  local count=0
  while IFS= read -r -d '' file; do
    local rel_path="${file#$input_dir/}"
    local output_file="${output_dir}/${rel_path}"

    process_image "$file" "$output_file"
    ((count++))
  done < <(find "$input_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.svg" -o -iname "*.gif" \) -print0)

  log_success "Optimized $count image(s)"
}

main "$@"
