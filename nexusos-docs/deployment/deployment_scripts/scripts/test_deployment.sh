#!/usr/bin/env bash
#
# NexusOS Documentation Platform - Deployment Testing
# Tests deployment configurations and endpoints
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

# Configuration
TEST_TIMEOUT="${TEST_TIMEOUT:-10}"
VERBOSE="${VERBOSE:-false}"

# Usage
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Test NexusOS documentation deployment configurations and endpoints.

OPTIONS:
  -h, --help           Show this help message
  -v, --verbose        Enable verbose output
  -t, --timeout SEC    Request timeout in seconds (default: 10)

EXAMPLES:
  # Run all tests
  $(basename "$0")

  # Run with verbose output
  $(basename "$0") --verbose

EOF
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help) usage ;;
    -v|--verbose) VERBOSE=true; set -x; shift ;;
    -t|--timeout) TEST_TIMEOUT="$2"; shift 2 ;;
    *) error "Unknown option: $1"; usage ;;
  esac
done

# Test endpoint availability
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  log_info "Testing $name: $url"

  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "$TEST_TIMEOUT" \
    "$url" || echo "000")

  if [[ "$status" == "$expected_status" ]]; then
    log_success "$name: OK (HTTP $status)"
    return 0
  else
    log_error "$name: FAILED (HTTP $status, expected $expected_status)"
    return 1
  fi
}

# Test Confluence configuration
test_confluence() {
  log_header "Testing Confluence Configuration"

  if [[ -z "${CONFLUENCE_BASE_URL:-}" ]]; then
    log_info "Skipping Confluence test (CONFLUENCE_BASE_URL not set)"
    return 0
  fi

  test_endpoint "Confluence" "$CONFLUENCE_BASE_URL" "200"
}

# Test GitBook deployment
test_gitbook() {
  log_header "Testing GitBook Configuration"

  if [[ -z "${GITBOOK_REPO_URL:-}" ]]; then
    log_info "Skipping GitBook test (GITBOOK_REPO_URL not set)"
    return 0
  fi

  # Test Git repository accessibility
  log_info "Testing Git repository access..."
  if git ls-remote "$GITBOOK_REPO_URL" HEAD &>/dev/null; then
    log_success "GitBook repository accessible"
  else
    log_error "GitBook repository not accessible"
    return 1
  fi
}

# Test GitHub Pages
test_github_pages() {
  log_header "Testing GitHub Pages Configuration"

  if [[ -z "${GITHUB_PAGES_REPO:-}" ]]; then
    log_info "Skipping GitHub Pages test (GITHUB_PAGES_REPO not set)"
    return 0
  fi

  local pages_url="https://${GITHUB_PAGES_REPO%%/*}.github.io/${GITHUB_PAGES_REPO##*/}/"
  test_endpoint "GitHub Pages" "$pages_url" "200"
}

# Test Notion API
test_notion() {
  log_header "Testing Notion Configuration"

  if [[ -z "${NOTION_API_TOKEN:-}" ]]; then
    log_info "Skipping Notion test (NOTION_API_TOKEN not set)"
    return 0
  fi

  log_info "Testing Notion API access..."
  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time "$TEST_TIMEOUT" \
    -H "Authorization: Bearer $NOTION_API_TOKEN" \
    -H "Notion-Version: 2022-06-28" \
    "https://api.notion.com/v1/users/me")

  if [[ "$status" == "200" ]]; then
    log_success "Notion API accessible"
  else
    log_error "Notion API test failed (HTTP $status)"
    return 1
  fi
}

# Test built documentation
test_build_artifacts() {
  log_header "Testing Build Artifacts"

  local dist_dir="dist"

  if [[ ! -d "$dist_dir" ]]; then
    log_error "Build directory not found: $dist_dir"
    return 1
  fi

  # Check for required directories
  local required_dirs=("html" "pdf" "diagrams" "assets")
  for dir in "${required_dirs[@]}"; do
    if [[ -d "${dist_dir}/${dir}" ]]; then
      log_success "Directory exists: ${dist_dir}/${dir}"
    else
      log_error "Directory missing: ${dist_dir}/${dir}"
    fi
  done

  # Check for manifest
  if [[ -f "${dist_dir}/manifest.json" ]]; then
    log_success "Manifest found: ${dist_dir}/manifest.json"
  else
    log_error "Manifest missing: ${dist_dir}/manifest.json"
  fi
}

# Main test suite
main() {
  log_header "Deployment Testing"

  local failed=0

  # Run tests
  test_build_artifacts || ((failed++))
  test_confluence || ((failed++))
  test_gitbook || ((failed++))
  test_github_pages || ((failed++))
  test_notion || ((failed++))

  # Summary
  echo ""
  log_header "Test Summary"

  if [[ $failed -eq 0 ]]; then
    log_success "All tests passed!"
    exit 0
  else
    log_error "$failed test(s) failed"
    exit 1
  fi
}

main "$@"
