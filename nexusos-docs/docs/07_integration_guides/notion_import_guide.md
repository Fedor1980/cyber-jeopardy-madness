---
title: Notion Import Guide
---
# Import to Notion

## Setup
1. Create Notion integration at https://notion.so/my-integrations
2. Get integration token
3. Share target page with integration

## Import
```bash
export NOTION_TOKEN="secret_xxx"
export NOTION_PAGE_ID="page-id"
python3 deployment/deployment_scripts/scripts/deploy_notion.py
```
