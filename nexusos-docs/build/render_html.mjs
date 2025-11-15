#!/usr/bin/env node
// Convert Markdown to self-contained HTML
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DOCS_DIR = 'docs';
const OUTPUT_DIR = 'outputs/html';

async function renderMarkdown() {
  console.log('Converting Markdown to HTML...');
  
  const files = await glob(`${DOCS_DIR}/**/*.md`);
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const html = marked(content);
    
    const relativePath = path.relative(DOCS_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, relativePath.replace('.md', '.html'));
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, wrapHTML(html));
    
    console.log(`✓ ${file} -> ${outputPath}`);
  }
  
  console.log('Markdown conversion complete');
}

function wrapHTML(content) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>body{max-width:800px;margin:0 auto;padding:2rem;font-family:system-ui;}</style>
</head><body>${content}</body></html>`;
}

renderMarkdown().catch(console.error);
