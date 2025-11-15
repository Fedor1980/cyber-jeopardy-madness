---
title: GitHub Pages Deployment
---
# Deploy to GitHub Pages

## Automated Deployment

GitHub Actions automatically deploys to GitHub Pages on push to main branch.

See `.github/workflows/deploy-docs.yml`

## Manual Deployment
```bash
npm run build
./deployment/deployment_scripts/scripts/deploy_github_pages.sh
```

Site will be available at: `https://nexusos.github.io/docs`
