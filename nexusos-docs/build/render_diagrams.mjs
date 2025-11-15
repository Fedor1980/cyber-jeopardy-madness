#!/usr/bin/env node
// Render Mermaid diagrams to SVG/PNG/PDF
import { run } from '@mermaid-js/mermaid-cli';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DIAGRAM_DIR = 'docs/04_workflow_diagrams/mermaid_sources';
const OUTPUT_DIR = 'outputs/diagrams';

async function renderDiagrams() {
  console.log('Rendering Mermaid diagrams...');
  
  const files = fs.readdirSync(DIAGRAM_DIR).filter(f => f.endsWith('.mmd'));
  
  for (const file of files) {
    const input = path.join(DIAGRAM_DIR, file);
    const basename = path.basename(file, '.mmd');
    
    // Generate hash for cache invalidation
    const content = fs.readFileSync(input, 'utf8');
    const hash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
    
    // Render to SVG
    const svgOutput = path.join(OUTPUT_DIR, `${basename}_${hash}.svg`);
    await run(input, svgOutput, { puppeteerConfig: {} });
    
    console.log(`✓ Rendered ${file} -> ${svgOutput}`);
  }
  
  console.log('All diagrams rendered successfully');
}

renderDiagrams().catch(console.error);
