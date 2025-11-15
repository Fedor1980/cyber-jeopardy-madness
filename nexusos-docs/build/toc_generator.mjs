#!/usr/bin/env node
// Generate table of contents manifest
import fs from 'fs';
import { glob } from 'glob';
import path from 'path';

async function generateTOC() {
  console.log('Generating table of contents...');
  
  const files = await glob('docs/**/*.md');
  const toc = files.map(file => ({
    path: file,
    title: extractTitle(file),
    category: path.dirname(file).split('/')[1]
  }));
  
  const manifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    files: toc
  };
  
  fs.writeFileSync('outputs/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('✓ Generated manifest.json');
}

function extractTitle(file) {
  const content = fs.readFileSync(file, 'utf8');
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1] : path.basename(file, '.md');
}

generateTOC().catch(console.error);
