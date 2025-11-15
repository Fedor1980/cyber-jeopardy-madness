#!/usr/bin/env node
// Convert Marp to HTML/PDF
import { Marp } from '@marp-team/marp-core';
import fs from 'fs';

const SLIDES_FILE = 'docs/05_training_materials/admin_training_deck.marp.md';
const OUTPUT_HTML = 'outputs/slides/admin_training.html';
const OUTPUT_PDF = 'outputs/slides/admin_training.pdf';

async function renderSlides() {
  console.log('Rendering Marp slides...');
  
  const markdown = fs.readFileSync(SLIDES_FILE, 'utf8');
  const marp = new Marp();
  const { html } = marp.render(markdown);
  
  fs.writeFileSync(OUTPUT_HTML, html);
  console.log(`✓ HTML: ${OUTPUT_HTML}`);
  
  // PDF generation would use marp-cli
  console.log('Use marp-cli for PDF: marp slides.md --pdf');
}

renderSlides().catch(console.error);
