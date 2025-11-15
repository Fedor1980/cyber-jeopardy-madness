#!/bin/bash
# NexusOS Health Check Script
set -e

echo "=== NexusOS Health Check ==="
echo "Checking system health..."

# API Health
if curl -sf https://api.nexusos.io/health > /dev/null; then
    echo "✓ API: Healthy"
else
    echo "✗ API: Unhealthy"
    exit 1
fi

# Database
if nexusos-admin db-status | grep -q "healthy"; then
    echo "✓ Database: Healthy"
else
    echo "✗ Database: Unhealthy"
    exit 1
fi

echo "=== All checks passed ==="
