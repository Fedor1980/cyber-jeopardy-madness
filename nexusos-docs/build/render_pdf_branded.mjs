#!/usr/bin/env node
// Generate Branded PDFs with custom covers, headers, footers, and watermarks
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { marked } from 'marked';

const DOCS_DIR = 'docs';
const OUTPUT_DIR = 'outputs/pdf-branded';
const BRANDING_DIR = 'branding';

// Load branding configuration
let BRANDING;
try {
  const brandingConfig = fs.readFileSync(path.join(BRANDING_DIR, 'config.json'), 'utf8');
  BRANDING = JSON.parse(brandingConfig);
  console.log(`✓ Loaded branding config for: ${BRANDING.companyName}`);
} catch (error) {
  console.warn('⚠ Could not load branding/config.json, using defaults');
  BRANDING = {
    companyName: 'NexusOS',
    tagline: 'Enterprise Documentation Platform',
    website: 'www.nexusos.com',
    email: 'support@nexusos.com',
    logoUrl: 'https://via.placeholder.com/200x60/6366f1/ffffff?text=NexusOS',
    primaryColor: '#6366f1',
    secondaryColor: '#1e293b',
    watermark: 'CONFIDENTIAL',
    showWatermark: false,
    version: '1.0',
    classification: 'Internal Use Only'
  };
}

async function generateBrandedPDFs() {
  console.log('Generating Branded PDFs...');

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = await glob(`${DOCS_DIR}/**/*.md`);
  const browser = await chromium.launch({ headless: true });

  for (const file of files) {
    // Skip Marp files
    if (file.includes('.marp.')) {
      console.log(`⊘ Skipping Marp file: ${file}`);
      continue;
    }

    try {
      const content = fs.readFileSync(file, 'utf8');
      const html = marked(content);

      // Extract title from first h1 or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.basename(file, '.md');

      // Get relative path for output
      const relativePath = path.relative(DOCS_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, relativePath.replace('.md', '.pdf'));
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

      // Generate metadata
      const metadata = {
        title,
        category: getCategoryFromPath(relativePath),
        author: BRANDING.companyName,
        subject: `${BRANDING.companyName} Documentation`,
        created: new Date().toISOString().split('T')[0]
      };

      // Create branded HTML
      const brandedHTML = createBrandedHTML(html, metadata);

      // Write HTML to temporary file
      const tempHtmlPath = outputPath.replace('.pdf', '.temp.html');
      fs.writeFileSync(tempHtmlPath, brandedHTML);

      // Generate PDF from file
      const page = await browser.newPage();
      await page.goto(`file://${path.resolve(tempHtmlPath)}`, { waitUntil: 'load', timeout: 10000 });

      await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
          top: '40px',
          bottom: '40px',
          left: '40px',
          right: '40px'
        },
        printBackground: true,
        preferCSSPageSize: false
      });

      await page.close();

      // Clean up temporary HTML file
      fs.unlinkSync(tempHtmlPath);

      console.log(`✓ ${file} -> ${outputPath}`);
    } catch (error) {
      console.error(`✗ Failed to generate PDF for ${file}:`, error.message);
    }
  }

  await browser.close();
  console.log(`Branded PDF generation complete. Output: ${OUTPUT_DIR}`);
}

function getCategoryFromPath(filePath) {
  const parts = filePath.split(path.sep);
  if (parts.length > 1) {
    const category = parts[0].replace(/^\d+_/, '').replace(/_/g, ' ');
    return category.charAt(0).toUpperCase() + category.slice(1);
  }
  return 'Documentation';
}

function createBrandedHTML(content, metadata) {
  const coverPage = createCoverPage(metadata);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${metadata.title}</title>
  <style>
    /* Page Setup */
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }

    /* Cover Page */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px;
      background: ${BRANDING.primaryColor};
      color: white;
      page-break-after: always;
    }

    .cover-logo {
      width: 200px;
      height: auto;
    }

    .cover-content {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .cover-category {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 20px;
      opacity: 0.9;
      font-weight: 500;
    }

    .cover-title {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      line-height: 1.2;
    }

    .cover-tagline {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
    }

    .cover-classification {
      display: inline-block;
      padding: 8px 20px;
      background: rgba(255, 255, 255, 0.2);
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .cover-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      opacity: 0.8;
    }

    .cover-version {
      font-weight: 600;
    }

    .cover-date {
      text-align: right;
    }

    /* Content Styling */
    .content {
      padding: 40px 60px;
      max-width: 100%;
    }

    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.25;
      color: ${BRANDING.primaryColor};
    }

    h1 {
      font-size: 32px;
      border-bottom: 3px solid ${BRANDING.primaryColor};
      padding-bottom: 0.3em;
      margin-top: 0;
    }

    h2 {
      font-size: 24px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 0.3em;
    }

    h3 { font-size: 20px; }
    h4 { font-size: 18px; }

    p {
      margin: 1em 0;
      text-align: justify;
    }

    /* Code Blocks */
    code {
      background: #f5f5f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: 'Consolas', 'Monaco', monospace;
      color: ${BRANDING.primaryColor};
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 1.5em 0;
      border-left: 4px solid ${BRANDING.primaryColor};
    }

    pre code {
      background: none;
      padding: 0;
      color: #e2e8f0;
    }

    /* Lists */
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }

    li {
      margin: 0.5em 0;
    }

    /* Links */
    a {
      color: ${BRANDING.primaryColor};
      text-decoration: none;
      font-weight: 500;
    }

    a:hover {
      text-decoration: underline;
    }

    /* Tables */
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
      font-size: 14px;
    }

    th, td {
      border: 1px solid #e5e7eb;
      padding: 12px;
      text-align: left;
    }

    th {
      background: ${BRANDING.primaryColor};
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.5px;
    }

    tr:nth-child(even) {
      background: #f9fafb;
    }

    /* Blockquotes */
    blockquote {
      border-left: 4px solid ${BRANDING.primaryColor};
      margin: 1.5em 0;
      padding: 1em 1.5em;
      background: #f9fafb;
      font-style: italic;
      color: #475569;
    }

    blockquote p:first-child {
      margin-top: 0;
    }

    blockquote p:last-child {
      margin-bottom: 0;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5em auto;
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Horizontal Rules */
    hr {
      border: none;
      border-top: 2px solid #e5e7eb;
      margin: 2em 0;
    }

    /* Watermark (optional) */
    ${BRANDING.showWatermark ? `
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 900;
      color: rgba(0, 0, 0, 0.05);
      z-index: -1;
      pointer-events: none;
      white-space: nowrap;
    }
    ` : ''}

    /* Page Breaks */
    h1, h2 {
      page-break-after: avoid;
    }

    pre, table, img, blockquote {
      page-break-inside: avoid;
    }
  </style>
</head>
<body>
  ${coverPage}
  ${BRANDING.showWatermark ? `<div class="watermark">${BRANDING.watermark}</div>` : ''}

  <div class="content">
    ${content}
  </div>
</body>
</html>`;
}

function createCoverPage(metadata) {
  // Use text logo instead of image to avoid loading issues
  return `
  <div class="cover-page">
    <div class="cover-header">
      <div style="font-size: 32px; font-weight: 900; color: white;">${BRANDING.companyName}</div>
    </div>

    <div class="cover-content">
      <div class="cover-category">${metadata.category}</div>
      <h1 class="cover-title">${metadata.title}</h1>
      <div class="cover-tagline">${BRANDING.tagline}</div>
      <div class="cover-classification">${BRANDING.classification}</div>
    </div>

    <div class="cover-footer">
      <div class="cover-contact">
        <div>${BRANDING.website}</div>
        <div>${BRANDING.email}</div>
      </div>
      <div class="cover-version">
        <div>Version ${BRANDING.version}</div>
        <div class="cover-date">${metadata.created}</div>
      </div>
    </div>
  </div>`;
}

function createHeader(metadata) {
  return `
  <div style="width: 100%; padding: 15px 40px; font-size: 10px; color: #64748b; border-bottom: 2px solid ${BRANDING.primaryColor};">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="font-weight: 600; color: ${BRANDING.primaryColor};">${BRANDING.companyName}</div>
      <div>${metadata.category}</div>
    </div>
  </div>`;
}

function createFooter(metadata) {
  return `
  <div style="width: 100%; padding: 15px 40px; font-size: 10px; color: #64748b; border-top: 1px solid #e5e7eb;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div style="display: flex; gap: 20px;">
        <span>${metadata.title}</span>
        <span style="color: #cbd5e1;">|</span>
        <span>${BRANDING.classification}</span>
      </div>
      <div style="display: flex; gap: 20px; align-items: center;">
        <span>${metadata.created}</span>
        <span style="color: #cbd5e1;">|</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    </div>
  </div>`;
}

generateBrandedPDFs().catch(console.error);
