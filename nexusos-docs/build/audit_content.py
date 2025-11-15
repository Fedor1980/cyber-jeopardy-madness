#!/usr/bin/env python3
# Content quality auditor
import os
import re
from pathlib import Path

def audit_content():
    print("Auditing documentation content...")
    
    docs_dir = Path("docs")
    issues = []
    
    for md_file in docs_dir.rglob("*.md"):
        content = md_file.read_text()
        
        # Check for TODO/FIXME
        if "TODO" in content or "FIXME" in content:
            issues.append(f"{md_file}: Contains TODO/FIXME")
        
        # Check for broken internal links
        links = re.findall(r'\[.+?\]\((.+?\.md)\)', content)
        for link in links:
            target = (md_file.parent / link).resolve()
            if not target.exists():
                issues.append(f"{md_file}: Broken link to {link}")
    
    if issues:
        print("Issues found:")
        for issue in issues:
            print(f"  - {issue}")
    else:
        print("✓ No issues found")

if __name__ == '__main__':
    audit_content()
