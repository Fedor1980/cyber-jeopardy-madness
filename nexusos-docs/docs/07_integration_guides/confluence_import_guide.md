---
title: Confluence Import Guide
---
# Import NexusOS Docs to Confluence

## Prerequisites
- Confluence admin access
- API token
- confluence-cli installed

## Import Steps

1. Configure credentials:
```bash
export CONFLUENCE_URL="https://company.atlassian.net"
export CONFLUENCE_USER="admin@company.com"
export CONFLUENCE_TOKEN="your-api-token"
```

2. Run import:
```bash
./deployment/deployment_scripts/scripts/deploy_confluence.sh
```

3. Verify in Confluence

## Customization
Edit `deployment/templates/confluence_space_template.xml`
