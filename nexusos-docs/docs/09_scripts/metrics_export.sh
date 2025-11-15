#!/bin/bash
# Export Metrics Script
set -e

OUTPUT_DIR="${OUTPUT_DIR:-./exports}"
DATE=$(date +%Y%m%d)

mkdir -p "$OUTPUT_DIR"

echo "Exporting metrics for $DATE..."

nexusos-admin metrics --export     --format csv     --output "$OUTPUT_DIR/metrics-$DATE.csv"

echo "Metrics exported to $OUTPUT_DIR/metrics-$DATE.csv"
