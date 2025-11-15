#!/usr/bin/env node
// Convert Markdown to self-contained HTML with Search
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DOCS_DIR = 'docs';
const OUTPUT_DIR = 'outputs/html';
const PUBLIC_DIR = 'public';

async function renderMarkdown() {
  console.log('Converting Markdown to HTML...');

  // Copy static assets first
  await copyStaticAssets();

  const files = await glob(`${DOCS_DIR}/**/*.md`);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const html = marked(content);

    const relativePath = path.relative(DOCS_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, relativePath.replace('.md', '.html'));

    // Calculate depth for relative paths to assets
    const depth = relativePath.split(path.sep).length - 1;
    const relativeRoot = depth > 0 ? '../'.repeat(depth) : './';

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, wrapHTML(html, relativeRoot));

    console.log(`✓ ${file} -> ${outputPath}`);
  }

  console.log('Markdown conversion complete');
}

async function copyStaticAssets() {
  // Create directories
  const jsDir = path.join(OUTPUT_DIR, 'js');
  const cssDir = path.join(OUTPUT_DIR, 'css');

  fs.mkdirSync(jsDir, { recursive: true });
  fs.mkdirSync(cssDir, { recursive: true });

  // Copy public assets if they exist
  if (fs.existsSync(PUBLIC_DIR)) {
    // Theme files
    if (fs.existsSync(path.join(PUBLIC_DIR, 'js', 'theme-switcher.js'))) {
      fs.copyFileSync(
        path.join(PUBLIC_DIR, 'js', 'theme-switcher.js'),
        path.join(jsDir, 'theme-switcher.js')
      );
      console.log('✓ Copied theme-switcher.js');
    }

    if (fs.existsSync(path.join(PUBLIC_DIR, 'css', 'themes.css'))) {
      fs.copyFileSync(
        path.join(PUBLIC_DIR, 'css', 'themes.css'),
        path.join(cssDir, 'themes.css')
      );
      console.log('✓ Copied themes.css');
    }

    // Search files
    if (fs.existsSync(path.join(PUBLIC_DIR, 'js', 'search.js'))) {
      fs.copyFileSync(
        path.join(PUBLIC_DIR, 'js', 'search.js'),
        path.join(jsDir, 'search.js')
      );
      console.log('✓ Copied search.js');
    }

    if (fs.existsSync(path.join(PUBLIC_DIR, 'css', 'search.css'))) {
      fs.copyFileSync(
        path.join(PUBLIC_DIR, 'css', 'search.css'),
        path.join(cssDir, 'search.css')
      );
      console.log('✓ Copied search.css');
    }
  }

  // Copy search index and manifest to root of HTML output
  if (fs.existsSync('outputs/search-index.json')) {
    fs.copyFileSync(
      'outputs/search-index.json',
      path.join(OUTPUT_DIR, 'search-index.json')
    );
    console.log('✓ Copied search index');
  }

  if (fs.existsSync('outputs/manifest.json')) {
    fs.copyFileSync(
      'outputs/manifest.json',
      path.join(OUTPUT_DIR, 'manifest.json')
    );
    console.log('✓ Copied manifest');
  }
}

function wrapHTML(content, relativeRoot = './') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>NexusOS Documentation</title>
  <link rel="stylesheet" href="${relativeRoot}css/themes.css">
  <link rel="stylesheet" href="${relativeRoot}css/search.css">
  <style>
    body {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
    }
    h1 { font-size: 2em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Consolas', 'Monaco', monospace;
    }
    pre {
      background: #f5f5f5;
      padding: 1em;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      background: none;
      padding: 0;
    }
    a {
      color: #6366f1;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    th {
      background: #f5f5f5;
      font-weight: 600;
    }
    blockquote {
      border-left: 4px solid #6366f1;
      margin: 1em 0;
      padding-left: 1em;
      color: #666;
    }
    img {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${content}

  <!-- Theme switcher -->
  <script src="${relativeRoot}js/theme-switcher.js"></script>
  <!-- Lunr.js for search -->
  <script src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"></script>
  <!-- Search functionality -->
  <script src="${relativeRoot}js/search.js"></script>
</body>
</html>`;
}

renderMarkdown().catch(console.error);
