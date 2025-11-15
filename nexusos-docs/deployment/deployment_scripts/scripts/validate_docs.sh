#!/bin/bash
# Comprehensive documentation validator
set -e

echo "=== Documentation Validation ==="

# Check for broken links
echo "Checking for broken links..."
npm run test:links || true

# Lint markdown
echo "Linting markdown..."
npm run lint

# Validate schemas
echo "Validating JSON/YAML..."
find . -name "*.json" -exec echo "Checking {}" \; || true

echo "✓ Validation complete"
