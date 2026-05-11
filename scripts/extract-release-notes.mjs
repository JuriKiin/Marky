#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!version) {
  console.error('Usage: extract-release-notes.mjs <version>');
  process.exit(1);
}

const md = fs.readFileSync(path.resolve('CHANGELOG.md'), 'utf-8');
const marker = `## [${version}]`;
const start = md.indexOf(marker);
if (start === -1) {
  console.error(`No section for v${version} in CHANGELOG.md.`);
  process.exit(1);
}

const lineEnd = md.indexOf('\n', start);
const contentStart = lineEnd === -1 ? md.length : lineEnd + 1;
const rest = md.slice(contentStart);
const nextIdx = rest.search(/\n## \[/);
const contentEnd = nextIdx === -1 ? md.length : contentStart + nextIdx;

process.stdout.write(md.slice(contentStart, contentEnd).trim() + '\n');
