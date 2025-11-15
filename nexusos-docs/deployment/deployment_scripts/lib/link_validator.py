#!/usr/bin/env python3
"""
NexusOS Documentation Platform - Link Validator
Validates internal and external links in documentation
"""

import os
import re
import sys
import argparse
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Set, Dict, Tuple

# Configuration
DOCS_DIR = Path('docs')
INTERNAL_LINK_PATTERN = r'\[([^\]]+)\]\(([^)]+)\)'
IMAGE_LINK_PATTERN = r'!\[([^\]]*)\]\(([^)]+)\)'

class LinkValidator:
    """Validates links in Markdown files"""

    def __init__(self, docs_dir: Path, check_external: bool = False):
        self.docs_dir = docs_dir
        self.check_external = check_external
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.checked_files: Set[Path] = set()

    def validate_all(self) -> Tuple[int, int]:
        """Validate all Markdown files in docs directory"""
        md_files = list(self.docs_dir.rglob('*.md'))

        print(f"ℹ️  Validating {len(md_files)} Markdown files...", file=sys.stderr)

        for md_file in md_files:
            self.validate_file(md_file)

        return len(self.errors), len(self.warnings)

    def validate_file(self, md_file: Path):
        """Validate links in a single Markdown file"""
        self.checked_files.add(md_file)

        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            self.errors.append(f"{md_file}: Failed to read file: {e}")
            return

        # Find all links
        links = re.findall(INTERNAL_LINK_PATTERN, content)
        images = re.findall(IMAGE_LINK_PATTERN, content)

        for text, url in links:
            self.validate_link(md_file, url, 'link')

        for alt, url in images:
            self.validate_link(md_file, url, 'image')

    def validate_link(self, source_file: Path, url: str, link_type: str):
        """Validate a single link"""
        # Skip external links unless enabled
        if url.startswith('http://') or url.startswith('https://'):
            if self.check_external:
                self.validate_external_link(source_file, url, link_type)
            return

        # Skip anchors and mailto links
        if url.startswith('#') or url.startswith('mailto:'):
            return

        # Remove anchor from URL
        url_without_anchor = url.split('#')[0]

        if not url_without_anchor:
            return  # Pure anchor link

        # Resolve relative path
        target_path = (source_file.parent / url_without_anchor).resolve()

        # Check if target exists
        if not target_path.exists():
            self.errors.append(
                f"{source_file}:{link_type}:{url} -> Target not found: {target_path}"
            )

    def validate_external_link(self, source_file: Path, url: str, link_type: str):
        """Validate external link (HEAD request)"""
        try:
            import requests
            response = requests.head(url, timeout=10, allow_redirects=True)
            if response.status_code >= 400:
                self.errors.append(
                    f"{source_file}:{link_type}:{url} -> HTTP {response.status_code}"
                )
        except ImportError:
            self.warnings.append(
                "requests library not installed, skipping external link validation"
            )
        except Exception as e:
            self.warnings.append(
                f"{source_file}:{link_type}:{url} -> {str(e)}"
            )

    def report(self):
        """Print validation report"""
        print("\n" + "=" * 60)
        print("Link Validation Report")
        print("=" * 60)

        if self.errors:
            print(f"\n❌ {len(self.errors)} Error(s):")
            for error in self.errors:
                print(f"  - {error}")

        if self.warnings:
            print(f"\n⚠️  {len(self.warnings)} Warning(s):")
            for warning in self.warnings:
                print(f"  - {warning}")

        if not self.errors and not self.warnings:
            print("\n✅ All links valid!")

        print(f"\nChecked {len(self.checked_files)} file(s)")

def main():
    """Main function"""
    parser = argparse.ArgumentParser(
        description='Validate links in NexusOS documentation'
    )
    parser.add_argument(
        '-d', '--docs-dir',
        type=Path,
        default=DOCS_DIR,
        help='Documentation directory (default: docs)'
    )
    parser.add_argument(
        '-e', '--check-external',
        action='store_true',
        help='Check external links (requires requests library)'
    )

    args = parser.parse_args()

    if not args.docs_dir.exists():
        print(f"❌ Documentation directory not found: {args.docs_dir}", file=sys.stderr)
        sys.exit(1)

    validator = LinkValidator(args.docs_dir, args.check_external)
    errors, warnings = validator.validate_all()
    validator.report()

    # Exit with error if any errors found
    sys.exit(1 if errors > 0 else 0)

if __name__ == '__main__':
    main()
