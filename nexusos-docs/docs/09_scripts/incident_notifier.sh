#!/bin/bash
# Incident Notification Script
set -e

SEVERITY="$1"
TITLE="$2"
DESCRIPTION="$3"

if [ -z "$SEVERITY" ]; then
    echo "Usage: incident_notifier.sh <severity> <title> <description>"
    exit 1
fi

echo "Creating incident: $TITLE"

nexusos-incident create     --severity "$SEVERITY"     --title "$TITLE"     --description "$DESCRIPTION"     --notify all

echo "Incident created and notifications sent"
