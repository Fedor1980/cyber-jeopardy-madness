#!/usr/bin/env bash
#
# NexusOS Documentation Platform - GitHub Pages Deployment
# Deploys HTML documentation to GitHub Pages
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

# Configuration
GITHUB_PAGES_REPO="${GITHUB_PAGES_REPO:-}"
GITHUB_DEPLOY_TOKEN="${GITHUB_DEPLOY_TOKEN:-}"
DRY_RUN="${DRY_RUN:-false}"
PAGES_BRANCH="${PAGES_BRANCH:-gh-pages}"
DIST_HTML="${DIST_HTML:-dist/html}"

# Usage
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy NexusOS documentation to GitHub Pages.

OPTIONS:
  -h, --help           Show this help message
  -d, --dry-run        Simulate deployment without making changes
  -v, --verbose        Enable verbose output
  -b, --branch NAME    Target branch (default: gh-pages)

ENVIRONMENT VARIABLES:
  GITHUB_PAGES_REPO        GitHub repository (owner/repo format, required)
  GITHUB_DEPLOY_TOKEN      GitHub Personal Access Token (required)
  PAGES_BRANCH             Target branch (default: gh-pages)
  DRY_RUN                  Set to 'true' for dry-run mode

EXAMPLES:
  # Deploy to GitHub Pages
  $(basename "$0")

  # Dry-run deployment
  $(basename "$0") --dry-run

EOF
  exit 0
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help) usage ;;
    -d|--dry-run) DRY_RUN=true; shift ;;
    -v|--verbose) set -x; shift ;;
    -b|--branch) PAGES_BRANCH="$2"; shift 2 ;;
    *) error "Unknown option: $1"; usage ;;
  esac
done

# Validate configuration
validate_github_pages_config() {
  log_info "Validating GitHub Pages configuration..."

  if [[ -z "$GITHUB_PAGES_REPO" ]]; then
    error "GITHUB_PAGES_REPO is required (format: owner/repo)"
  fi

  if [[ -z "$GITHUB_DEPLOY_TOKEN" ]]; then
    error "GITHUB_DEPLOY_TOKEN is required"
  fi

  if [[ ! -d "$DIST_HTML" ]]; then
    error "HTML build directory not found: $DIST_HTML"
  fi

  log_success "Configuration validated"
}

# Deploy to GitHub Pages
deploy_to_pages() {
  log_info "Deploying to GitHub Pages..."

  local repo_url="https://${GITHUB_DEPLOY_TOKEN}@github.com/${GITHUB_PAGES_REPO}.git"
  local temp_dir="/tmp/gh-pages-deploy-$$"

  # Clone gh-pages branch or create orphan branch
  mkdir -p "$temp_dir"
  cd "$temp_dir"

  git init
  git config user.name "NexusOS Deploy Bot"
  git config user.email "deploy@nexusos.io"

  # Try to clone existing gh-pages branch
  if git ls-remote --heads "$repo_url" "$PAGES_BRANCH" | grep -q "$PAGES_BRANCH"; then
    log_info "Cloning existing $PAGES_BRANCH branch..."
    git pull "$repo_url" "$PAGES_BRANCH"
  else
    log_info "Creating new orphan branch: $PAGES_BRANCH"
    git checkout --orphan "$PAGES_BRANCH"
  fi

  # Clear existing content
  git rm -rf . 2>/dev/null || true

  # Copy new HTML files
  log_info "Copying HTML files..."
  cp -r "${DIST_HTML}"/* .

  # Create .nojekyll to bypass Jekyll processing
  touch .nojekyll

  # Create CNAME if custom domain is specified
  if [[ -n "${GITHUB_PAGES_CNAME:-}" ]]; then
    echo "$GITHUB_PAGES_CNAME" > CNAME
  fi

  # Commit changes
  git add .

  if git diff --staged --quiet; then
    log_info "No changes to deploy"
    cd - > /dev/null
    rm -rf "$temp_dir"
    return 0
  fi

  git commit -m "Deploy documentation - $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY-RUN] Would push to: $GITHUB_PAGES_REPO ($PAGES_BRANCH)"
    git log -1 --stat
  else
    log_info "Pushing to GitHub Pages..."
    git push -f "$repo_url" "$PAGES_BRANCH"
    log_success "Pushed to GitHub Pages"
  fi

  # Cleanup
  cd - > /dev/null
  rm -rf "$temp_dir"
}

# Main deployment
main() {
  log_header "GitHub Pages Deployment"

  validate_github_pages_config

  log_info "Repository: $GITHUB_PAGES_REPO"
  log_info "Branch: $PAGES_BRANCH"
  log_info "Dry-run mode: $DRY_RUN"

  deploy_to_pages

  log_success "GitHub Pages deployment complete!"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "This was a dry-run. No changes were pushed."
  else
    log_info "Documentation available at: https://${GITHUB_PAGES_REPO%%/*}.github.io/${GITHUB_PAGES_REPO##*/}/"
  fi
}

main "$@"
