#!/usr/bin/env bash
#
# NexusOS Documentation Platform - GitBook Deployment
# Deploys documentation to GitBook via Git repository
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/../lib/common.sh"

# Configuration
GITBOOK_REPO_URL="${GITBOOK_REPO_URL:-}"
GITBOOK_DEPLOY_KEY="${GITBOOK_DEPLOY_KEY:-}"
DRY_RUN="${DRY_RUN:-false}"
TEMP_DIR="/tmp/gitbook-deploy-$$"

# Usage
usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy NexusOS documentation to GitBook.

OPTIONS:
  -h, --help           Show this help message
  -d, --dry-run        Simulate deployment without making changes
  -v, --verbose        Enable verbose output

ENVIRONMENT VARIABLES:
  GITBOOK_REPO_URL         GitBook repository URL (required)
  GITBOOK_DEPLOY_KEY       Path to SSH deploy key (optional)
  DRY_RUN                  Set to 'true' for dry-run mode

EXAMPLES:
  # Deploy to GitBook
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
    *) error "Unknown option: $1"; usage ;;
  esac
done

# Validate configuration
validate_gitbook_config() {
  log_info "Validating GitBook configuration..."

  if [[ -z "$GITBOOK_REPO_URL" ]]; then
    error "GITBOOK_REPO_URL is required"
  fi

  log_success "Configuration validated"
}

# Clone GitBook repository
clone_repo() {
  log_info "Cloning GitBook repository..."

  mkdir -p "$TEMP_DIR"

  if [[ -n "$GITBOOK_DEPLOY_KEY" ]] && [[ -f "$GITBOOK_DEPLOY_KEY" ]]; then
    GIT_SSH_COMMAND="ssh -i $GITBOOK_DEPLOY_KEY -o StrictHostKeyChecking=no" \
      git clone "$GITBOOK_REPO_URL" "$TEMP_DIR"
  else
    git clone "$GITBOOK_REPO_URL" "$TEMP_DIR"
  fi

  log_success "Repository cloned"
}

# Generate SUMMARY.md for GitBook
generate_summary() {
  log_info "Generating SUMMARY.md..."

  cat > "${TEMP_DIR}/SUMMARY.md" <<'EOF'
# Table of Contents

## API Documentation
* [API Overview](01_api_documentation/README.md)
* [API Quickstart](01_api_documentation/api_quickstart.md)
* [Authentication Guide](01_api_documentation/authentication_guide.md)
* [Rate Limits](01_api_documentation/rate_limits.md)

## User Guides
* [User Onboarding](02_user_guides/user_onboarding_guide.md)
* [Quick Start Checklist](02_user_guides/quick_start_checklist.md)
* [FAQ](02_user_guides/faq.md)

## Admin Manual
* [Admin Manual](03_admin_manual/admin_manual_full.md)
* [Incident Playbooks](03_admin_manual/incident_playbooks/README.md)

## Training Materials
* [Training Deck](05_training_materials/admin_training_deck.marp.md)
* [Exercises](05_training_materials/exercises/README.md)

## Quick References
* [Admin Cheatsheet](06_quick_references/admin_cheatsheet.md)
* [Incident Response Checklist](06_quick_references/incident_response_checklist.md)

## Integration Guides
* [Confluence](07_integration_guides/confluence_import_guide.md)
* [GitBook](07_integration_guides/gitbook_setup_guide.md)
* [GitHub Pages](07_integration_guides/github_pages_deployment.md)
EOF

  log_success "SUMMARY.md generated"
}

# Copy documentation files
copy_docs() {
  log_info "Copying documentation files..."

  rsync -av --delete \
    --exclude='.git' \
    --exclude='node_modules' \
    docs/ "${TEMP_DIR}/"

  log_success "Documentation copied"
}

# Commit and push changes
deploy_to_git() {
  log_info "Committing changes..."

  cd "$TEMP_DIR"

  git config user.name "NexusOS Deploy Bot"
  git config user.email "deploy@nexusos.io"

  git add .

  if git diff --staged --quiet; then
    log_info "No changes to commit"
    return 0
  fi

  git commit -m "Deploy documentation - $(date -u +"%Y-%m-%d %H:%M:%S UTC")"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY-RUN] Would push to: $GITBOOK_REPO_URL"
    git log -1 --stat
  else
    log_info "Pushing to GitBook..."
    if [[ -n "$GITBOOK_DEPLOY_KEY" ]] && [[ -f "$GITBOOK_DEPLOY_KEY" ]]; then
      GIT_SSH_COMMAND="ssh -i $GITBOOK_DEPLOY_KEY -o StrictHostKeyChecking=no" \
        git push origin main
    else
      git push origin main
    fi
    log_success "Pushed to GitBook"
  fi
}

# Cleanup
cleanup() {
  log_info "Cleaning up..."
  rm -rf "$TEMP_DIR"
  log_success "Cleanup complete"
}

# Main deployment
main() {
  log_header "GitBook Deployment"

  validate_gitbook_config

  log_info "Dry-run mode: $DRY_RUN"

  trap cleanup EXIT

  clone_repo
  copy_docs
  generate_summary
  deploy_to_git

  log_success "GitBook deployment complete!"

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "This was a dry-run. No changes were pushed."
  fi
}

main "$@"
