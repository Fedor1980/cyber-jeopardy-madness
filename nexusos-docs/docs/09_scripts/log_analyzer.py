#!/usr/bin/env python3
# Log Analyzer Script
import sys
import re
from collections import Counter

def analyze_logs(log_file):
    errors = Counter()
    
    with open(log_file) as f:
        for line in f:
            if 'ERROR' in line:
                # Extract error type
                match = re.search(r'ERROR: (.+)', line)
                if match:
                    errors[match.group(1)] += 1
    
    print("Top Errors:")
    for error, count in errors.most_common(10):
        print(f"  {count:4d} - {error}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: log_analyzer.py <logfile>")
        sys.exit(1)
    analyze_logs(sys.argv[1])
