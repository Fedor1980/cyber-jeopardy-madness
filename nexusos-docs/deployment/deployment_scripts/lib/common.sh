#!/usr/bin/env bash
#
# NexusOS Documentation Platform - Common Shell Functions
# Shared utilities for deployment scripts
#

# Colors
readonly COLOR_RESET='\033[0m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[0;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_CYAN='\033[0;36m'

# Logging functions
log_header() {
  local message="$1"
  echo -e "${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}"
  echo -e "${COLOR_CYAN}${message}${COLOR_RESET}"
  echo -e "${COLOR_CYAN}═══════════════════════════════════════${COLOR_RESET}"
}

log_info() {
  echo -e "${COLOR_BLUE}ℹ️  ${1}${COLOR_RESET}" >&2
}

log_success() {
  echo -e "${COLOR_GREEN}✅ ${1}${COLOR_RESET}" >&2
}

log_warn() {
  echo -e "${COLOR_YELLOW}⚠️  ${1}${COLOR_RESET}" >&2
}

log_error() {
  echo -e "${COLOR_RED}❌ ${1}${COLOR_RESET}" >&2
}

# Error handling
error() {
  log_error "$1"
  exit 1
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Require command
require_command() {
  local cmd="$1"
  local install_hint="${2:-}"

  if ! command_exists "$cmd"; then
    error "Required command not found: $cmd${install_hint:+ ($install_hint)}"
  fi
}

# Check file exists
require_file() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    error "Required file not found: $file"
  fi
}

# Check directory exists
require_directory() {
  local dir="$1"

  if [[ ! -d "$dir" ]]; then
    error "Required directory not found: $dir"
  fi
}

# Retry with exponential backoff
retry_with_backoff() {
  local max_attempts="${1:-4}"
  local delay="${2:-2}"
  local command="${@:3}"

  local attempt=1
  local exit_code=0

  while [[ $attempt -le $max_attempts ]]; do
    log_info "Attempt $attempt/$max_attempts: $command"

    if eval "$command"; then
      return 0
    else
      exit_code=$?

      if [[ $attempt -lt $max_attempts ]]; then
        log_warn "Command failed, retrying in ${delay}s..."
        sleep "$delay"
        delay=$((delay * 2))
      fi

      ((attempt++))
    fi
  done

  log_error "Command failed after $max_attempts attempts"
  return $exit_code
}

# Validate URL
validate_url() {
  local url="$1"

  if [[ ! "$url" =~ ^https?:// ]]; then
    error "Invalid URL: $url (must start with http:// or https://)"
  fi
}

# JSON logging
log_json() {
  local level="$1"
  local message="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  jq -n \
    --arg level "$level" \
    --arg message "$message" \
    --arg timestamp "$timestamp" \
    '{
      timestamp: $timestamp,
      level: $level,
      message: $message
    }'
}

# Send notification (Slack, Teams, etc.)
send_notification() {
  local message="$1"
  local webhook_url="${2:-${SLACK_WEBHOOK_URL:-}}"

  if [[ -z "$webhook_url" ]]; then
    log_info "No webhook URL configured, skipping notification"
    return 0
  fi

  log_info "Sending notification..."

  local payload=$(jq -n --arg text "$message" '{"text": $text}')

  if curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$webhook_url" >/dev/null; then
    log_success "Notification sent"
  else
    log_warn "Failed to send notification"
  fi
}

# Calculate file checksum
checksum() {
  local file="$1"

  if command_exists sha256sum; then
    sha256sum "$file" | awk '{print $1}'
  elif command_exists shasum; then
    shasum -a 256 "$file" | awk '{print $1}'
  else
    error "No checksum command available (sha256sum or shasum required)"
  fi
}

# Cleanup handler
cleanup_on_exit() {
  local temp_dirs=("$@")

  for dir in "${temp_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
      log_info "Cleaning up: $dir"
      rm -rf "$dir"
    fi
  done
}

# Export functions
export -f log_header
export -f log_info
export -f log_success
export -f log_warn
export -f log_error
export -f error
export -f command_exists
export -f require_command
export -f require_file
export -f require_directory
export -f retry_with_backoff
export -f validate_url
export -f log_json
export -f send_notification
export -f checksum
export -f cleanup_on_exit
