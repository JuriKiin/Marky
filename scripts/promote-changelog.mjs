#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const version = process.argv[2];
if (!version) {
  console.error('Usage: promote-changelog.mjs <version>');
  process.exit(1);
}

const file = path.resolve('CHANGELOG.md');
const md = fs.readFileSync(file, 'utf-8');

const header = '## [Unreleased]';
const start = md.indexOf(header);
if (start === -1) {
  console.error(`No "${header}" section found in CHANGELOG.md.`);
  process.exit(1);
}

const afterHeader = start + header.length;
const rest = md.slice(afterHeader);
const nextIdx = rest.search(/\n## \[/);
const end = nextIdx === -1 ? md.length : afterHeader + nextIdx;

const unreleasedBody = md.slice(afterHeader, end).replace(/^\s*\n/, '').replace(/\s+$/, '');
const date = new Date().toISOString().slice(0, 10);

const replacement = `## [Unreleased]\n\n## [${version}] - ${date}\n\n${unreleasedBody}\n`;

const updated = md.slice(0, start) + replacement + md.slice(end);
fs.writeFileSync(file, updated.replace(/\n{3,}/g, '\n\n'));

console.log(`Promoted Unreleased → [${version}] - ${date}`);
