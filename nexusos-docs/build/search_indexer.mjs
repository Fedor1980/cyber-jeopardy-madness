#!/usr/bin/env node
// Build search index with lunr.js
import lunr from 'lunr';
import fs from 'fs';
import { glob } from 'glob';

async function buildSearchIndex() {
  console.log('Building search index...');

  // Create output directory if it doesn't exist
  if (!fs.existsSync('outputs')) {
    fs.mkdirSync('outputs', { recursive: true });
  }

  const files = await glob('docs/**/*.md');
  const documents = files.map((file, id) => ({
    id,
    path: file,
    content: fs.readFileSync(file, 'utf8')
  }));
  
  const idx = lunr(function() {
    this.ref('id');
    this.field('content');
    documents.forEach(doc => this.add(doc));
  });
  
  fs.writeFileSync('outputs/search-index.json', JSON.stringify(idx));
  console.log('✓ Search index built');
}

buildSearchIndex().catch(console.error);
