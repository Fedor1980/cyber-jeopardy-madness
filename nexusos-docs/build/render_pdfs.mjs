#!/usr/bin/env node
// Generate PDFs using Playwright
import { chromium } from 'playwright';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';

const HTML_DIR = 'outputs/html';
const OUTPUT_DIR = 'outputs/pdf';

async function generatePDFs() {
  console.log('Generating PDFs...');

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();
  const files = await glob(`${HTML_DIR}/**/*.html`);
  
  for (const file of files) {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve(file)}`);
    
    const relativePath = path.relative(HTML_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, relativePath.replace('.html', '.pdf'));

    // Create subdirectories if needed
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    await page.pdf({ path: outputPath, format: 'A4' });
    console.log(`✓ ${file} -> ${outputPath}`);
  }
  
  await browser.close();
  console.log('PDF generation complete');
}

generatePDFs().catch(console.error);
