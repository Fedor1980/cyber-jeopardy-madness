#!/bin/bash
# Master deployment script
set -e

DRY_RUN="${DRY_RUN:-false}"

echo "=== NexusOS Documentation Deployment ==="

if [ "$DRY_RUN" = "true" ]; then
    echo "DRY RUN MODE"
fi

# Build documentation
echo "Building documentation..."
npm run build

# Validate
echo "Validating..."
./deployment/deployment_scripts/scripts/validate_docs.sh

# Deploy to all platforms
echo "Deploying to all platforms..."

if [ "$DRY_RUN" != "true" ]; then
    ./deployment/deployment_scripts/scripts/deploy_github_pages.sh
    ./deployment/deployment_scripts/scripts/deploy_confluence.sh
    # Add other deployments as needed
fi

echo "Deployment complete!"
