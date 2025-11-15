# NexusOS Documentation Platform - Deployment Scripts

Automated deployment scripts for deploying NexusOS documentation to multiple platforms.

## Overview

This directory contains deployment scripts, configurations, and templates for deploying documentation to:

- **Confluence** - Atlassian Confluence wiki
- **GitBook** - GitBook documentation platform
- **GitHub Pages** - Static site hosting
- **Notion** - Notion workspace

## Directory Structure

```
deployment_scripts/
├── config/              # Platform-specific configurations
│   ├── deployment.config
│   ├── confluence.config
│   ├── gitbook.config
│   ├── github.config
│   └── notion.config
├── scripts/             # Deployment scripts
│   ├── deploy_all.sh
│   ├── deploy_confluence.sh
│   ├── deploy_gitbook.sh
│   ├── deploy_github_pages.sh
│   ├── deploy_notion.py
│   ├── validate_docs.sh
│   ├── test_deployment.sh
│   └── rollback.sh
├── lib/                 # Shared libraries
│   ├── common.sh
│   ├── link_validator.py
│   └── image_optimizer.sh
└── templates/           # Platform templates
    ├── confluence_space_template.xml
    ├── gitbook_config_template.yaml
    ├── github_workflow_template.yaml
    └── notion_template.json
```

## Quick Start

### 1. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

### 2. Validate Documentation

Before deploying, validate all documentation:

```bash
bash deployment/deployment_scripts/scripts/validate_docs.sh
```

### 3. Deploy

Deploy to all configured platforms:

```bash
bash deployment/deployment_scripts/scripts/deploy_all.sh
```

Or deploy to a specific platform:

```bash
# Deploy to Confluence
bash deployment/deployment_scripts/scripts/deploy_confluence.sh

# Deploy to GitBook
bash deployment/deployment_scripts/scripts/deploy_gitbook.sh

# Deploy to GitHub Pages
bash deployment/deployment_scripts/scripts/deploy_github_pages.sh

# Deploy to Notion
python3 deployment/deployment_scripts/scripts/deploy_notion.py
```

## Deployment Scripts

### deploy_all.sh

Master deployment script that orchestrates deployments to all configured platforms.

**Usage:**
```bash
./deploy_all.sh [OPTIONS]

OPTIONS:
  -h, --help           Show help message
  -d, --dry-run        Simulate deployment without making changes
  -v, --verbose        Enable verbose output
  -p, --platform NAME  Deploy to specific platform only
```

**Examples:**
```bash
# Dry-run deployment to all platforms
./deploy_all.sh --dry-run

# Deploy to GitHub Pages only
./deploy_all.sh --platform github-pages

# Verbose deployment
./deploy_all.sh --verbose
```

### deploy_confluence.sh

Deploys documentation to Atlassian Confluence.

**Requirements:**
- `CONFLUENCE_BASE_URL`
- `CONFLUENCE_USERNAME`
- `CONFLUENCE_API_TOKEN`

**Features:**
- Creates/updates pages in Confluence space
- Converts Markdown to Confluence Storage Format
- Maintains page hierarchy
- Supports dry-run mode

### deploy_gitbook.sh

Deploys documentation to GitBook via Git repository.

**Requirements:**
- `GITBOOK_REPO_URL`
- `GITBOOK_DEPLOY_KEY` (optional, for SSH)

**Features:**
- Clones GitBook repository
- Copies documentation files
- Generates `SUMMARY.md` for navigation
- Commits and pushes changes

### deploy_github_pages.sh

Deploys HTML documentation to GitHub Pages.

**Requirements:**
- `GITHUB_PAGES_REPO` (format: owner/repo)
- `GITHUB_DEPLOY_TOKEN`

**Features:**
- Deploys to `gh-pages` branch
- Supports custom domains (CNAME)
- Creates `.nojekyll` file
- Force push option

### deploy_notion.py

Deploys documentation to Notion workspace.

**Requirements:**
- `NOTION_API_TOKEN`
- `NOTION_DATABASE_ID`
- Python 3.11+

**Features:**
- Creates/updates Notion pages
- Converts Markdown to Notion blocks
- Sets page properties and metadata
- Batch processing

### validate_docs.sh

Validates documentation before deployment.

**Checks:**
- Internal link validity
- Image references
- Mermaid diagram syntax
- Front-matter schema
- File structure

### test_deployment.sh

Tests deployment configurations and endpoints.

**Tests:**
- Endpoint availability
- API authentication
- Git repository access
- Build artifacts

### rollback.sh

Rolls back deployments to previous versions.

**Usage:**
```bash
./rollback.sh --platform github-pages --target v1.0.0
```

## Configuration

### Environment Variables

All deployment scripts use environment variables for configuration. Key variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `CONFLUENCE_BASE_URL` | Confluence instance URL | For Confluence |
| `CONFLUENCE_API_TOKEN` | Confluence API token | For Confluence |
| `GITBOOK_REPO_URL` | GitBook Git repository URL | For GitBook |
| `GITHUB_PAGES_REPO` | GitHub repository (owner/repo) | For GitHub Pages |
| `GITHUB_DEPLOY_TOKEN` | GitHub Personal Access Token | For GitHub Pages |
| `NOTION_API_TOKEN` | Notion integration token | For Notion |
| `NOTION_DATABASE_ID` | Target Notion database ID | For Notion |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | Optional |
| `DRY_RUN` | Set to `true` for dry-run mode | Optional |

### Configuration Files

Platform-specific settings are stored in `config/*.config`:

- `deployment.config` - Global deployment settings
- `confluence.config` - Confluence-specific options
- `gitbook.config` - GitBook-specific options
- `github.config` - GitHub Pages options
- `notion.config` - Notion-specific options

## Library Functions

### common.sh

Shared Bash functions for all deployment scripts:

- Logging functions (`log_info`, `log_success`, `log_error`)
- Error handling
- Retry with exponential backoff
- URL validation
- Notification sending
- File checksums

### link_validator.py

Python script to validate links in Markdown files:

```bash
python3 lib/link_validator.py -d docs/
python3 lib/link_validator.py --check-external
```

### image_optimizer.sh

Optimizes images for web deployment:

```bash
bash lib/image_optimizer.sh docs/ dist/optimized/
bash lib/image_optimizer.sh --quality 90 docs/ dist/optimized/
```

## CI/CD Integration

### GitHub Actions

Example workflow (also see `templates/github_workflow_template.yaml`):

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy documentation
        env:
          GITHUB_DEPLOY_TOKEN: ${{ secrets.GITHUB_DEPLOY_TOKEN }}
        run: bash deployment/deployment_scripts/scripts/deploy_all.sh
```

### GitLab CI

```yaml
deploy:
  stage: deploy
  script:
    - bash deployment/deployment_scripts/scripts/deploy_all.sh
  only:
    - main
```

## Troubleshooting

### Common Issues

**Issue:** `CONFLUENCE_API_TOKEN is required`
**Solution:** Set the environment variable or add it to `.env`

**Issue:** `Permission denied` errors
**Solution:** Make scripts executable: `chmod +x deployment/deployment_scripts/scripts/*.sh`

**Issue:** Links validation fails
**Solution:** Run link validator: `python3 lib/link_validator.py -d docs/`

**Issue:** Deployment fails with 403 error
**Solution:** Check API token permissions and expiration

### Debug Mode

Enable debug mode for detailed output:

```bash
export DEBUG=true
bash deployment/deployment_scripts/scripts/deploy_all.sh --verbose
```

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** or secret managers
3. **Rotate API tokens** regularly (every 90 days)
4. **Use deploy keys** with minimum required permissions
5. **Enable secret scanning** in CI/CD
6. **Review deployment logs** for sensitive data

## Support

For deployment issues:
- Email: devops@nexusos.io
- Docs: https://docs.nexusos.io/deployment
- Issues: https://github.com/nexusos/docs/issues
