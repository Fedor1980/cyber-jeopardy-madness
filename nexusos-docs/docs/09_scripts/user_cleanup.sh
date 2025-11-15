#!/bin/bash
# User Cleanup Script - Remove inactive users
set -e

DRY_RUN="${DRY_RUN:-true}"
DAYS_INACTIVE="${DAYS_INACTIVE:-90}"

echo "Finding users inactive for >$DAYS_INACTIVE days..."

if [ "$DRY_RUN" = "true" ]; then
    echo "DRY RUN MODE - No changes will be made"
fi

nexusos-admin list-users --inactive-days $DAYS_INACTIVE | while read user; do
    if [ "$DRY_RUN" = "true" ]; then
        echo "Would deactivate: $user"
    else
        nexusos-admin deactivate-user --email "$user"
        echo "Deactivated: $user"
    fi
done
