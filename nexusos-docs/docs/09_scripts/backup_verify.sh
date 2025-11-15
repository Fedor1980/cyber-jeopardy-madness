#!/bin/bash
# Backup Verification Script
set -e

BACKUP_DIR="${BACKUP_DIR:-/backups}"

echo "Verifying backups in $BACKUP_DIR"

# Check latest backup exists
LATEST=$(ls -t $BACKUP_DIR/*.tar.gz | head -1)
if [ -z "$LATEST" ]; then
    echo "ERROR: No backups found"
    exit 1
fi

echo "Latest backup: $LATEST"

# Verify integrity
if tar -tzf "$LATEST" > /dev/null 2>&1; then
    echo "✓ Backup integrity: OK"
else
    echo "✗ Backup corrupted"
    exit 1
fi

echo "Backup verification complete"
