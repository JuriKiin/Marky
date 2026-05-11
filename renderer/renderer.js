import { marked } from '../node_modules/marked/lib/marked.esm.js';
import DOMPurify from '../node_modules/dompurify/dist/purify.es.mjs';

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const editorPane = document.getElementById('editorPane');
const previewPane = document.getElementById('previewPane');
const divider = document.getElementById('divider');
const filenameInput = document.getElementById('filename');
const dirtyDot = document.getElementById('dirtyDot');
const settingsBtn = document.getElementById('settingsBtn');
const settingsBackdrop = document.getElementById('settingsBackdrop');
const settingsClose = document.getElementById('settingsClose');
const settingTheme = document.getElementById('settingTheme');
const settingFontSize = document.getElementById('settingFontSize');
const settingPreviewSize = document.getElementById('settingPreviewSize');
const settingWordWrap = document.getElementById('settingWordWrap');
const viewButtons = document.querySelectorAll('.view-btn');
const customThemeBlock = document.getElementById('customThemeBlock');
const customChainInput = document.getElementById('settingCustomChain');
const customChainError = document.getElementById('customChainError');
const customSwatches = document.querySelectorAll('#customSwatches .swatch');
const presetChips = document.querySelectorAll('.preset-chip');
const copyCurrentBtn = document.getElementById('copyCurrentColors');
const helpBtn = document.getElementById('helpBtn');
const guideBackdrop = document.getElementById('guideBackdrop');
const guideClose = document.getElementById('guideClose');
const guideBody = document.getElementById('guideBody');
const openChangelogBtn = document.getElementById('openChangelogBtn');
const changelogBackdrop = document.getElementById('changelogBackdrop');
const changelogClose = document.getElementById('changelogClose');
const changelogBody = document.getElementById('changelogBody');

let lastSavedContent = '';
let isDirty = false;
let currentFilePath = null;
let currentDisplayName = 'Untitled.md';

marked.setOptions({ gfm: true, breaks: false });

function render() {
  const raw = marked.parse(editor.value);
  preview.innerHTML = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
  preview.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });
}

function setDirty(dirty) {
  if (dirty === isDirty) return;
  isDirty = dirty;
  dirtyDot.classList.toggle('visible', dirty);
  window.marky?.markDirty(dirty);
}

function setFilename(name) {
  currentDisplayName = name || 'Untitled.md';
  if (document.activeElement !== filenameInput) {
    filenameInput.value = currentDisplayName;
  }
}

editor.addEventListener('input', () => {
  render();
  setDirty(editor.value !== lastSavedContent);
});

editor.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.setRangeText('  ', start, end, 'end');
    editor.dispatchEvent(new Event('input'));
  }
});

window.marky?.onFileLoaded(({ filePath, content }) => {
  editor.value = content;
  lastSavedContent = content;
  currentFilePath = filePath;
  setDirty(false);
  render();
});

window.marky?.onFileSaved(({ filePath }) => {
  currentFilePath = filePath;
  lastSavedContent = editor.value;
  setDirty(false);
});

window.marky?.onFileNew(() => {
  editor.value = '';
  lastSavedContent = '';
  currentFilePath = null;
  setDirty(false);
  render();
  editor.focus();
});

window.marky?.onFileState(({ filePath, displayName }) => {
  currentFilePath = filePath;
  setFilename(displayName);
});

window.marky?.onRequestSave(({ saveAs }) => {
  const typed = filenameInput.value.trim();
  window.marky.saveContent({ content: editor.value, saveAs, suggestedName: typed || undefined });
});

function setView(view) {
  editorPane.classList.toggle('hidden', view === 'preview');
  previewPane.classList.toggle('hidden', view === 'editor');
  viewButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });
  settings = { ...settings, view };
  saveSettings(settings);
}

viewButtons.forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.view));
});

window.marky?.onSetView((view) => setView(view));

filenameInput.addEventListener('focus', () => {
  filenameInput.select();
});

filenameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    filenameInput.blur();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    filenameInput.value = currentDisplayName;
    filenameInput.blur();
  }
});

filenameInput.addEventListener('blur', async () => {
  const newName = filenameInput.value.trim();
  if (!newName || newName === currentDisplayName) {
    filenameInput.value = currentDisplayName;
    return;
  }
  const result = await window.marky?.renameFile(newName);
  if (result?.ok) {
    currentFilePath = result.filePath;
    setFilename(result.displayName);
  } else {
    filenameInput.value = currentDisplayName;
    if (result?.error) alert(result.error);
  }
});

function openSettings() {
  settingsBackdrop.classList.remove('hidden');
}
function closeSettings() {
  settingsBackdrop.classList.add('hidden');
}
settingsBtn.addEventListener('click', openSettings);
settingsClose.addEventListener('click', closeSettings);
settingsBackdrop.addEventListener('click', (e) => {
  if (e.target === settingsBackdrop) closeSettings();
});

function openGuide() {
  guideBackdrop.classList.remove('hidden');
}
function closeGuide() {
  guideBackdrop.classList.add('hidden');
}
helpBtn.addEventListener('click', openGuide);
window.marky?.onOpenGuide(openGuide);
guideClose.addEventListener('click', closeGuide);
guideBackdrop.addEventListener('click', (e) => {
  if (e.target === guideBackdrop) closeGuide();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!settingsBackdrop.classList.contains('hidden')) closeSettings();
    if (!guideBackdrop.classList.contains('hidden')) closeGuide();
    if (!changelogBackdrop.classList.contains('hidden')) closeChangelog();
  }
});

const GUIDE_SECTIONS = [
  {
    title: 'Headings',
    syntax: '# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4',
  },
  {
    title: 'Emphasis',
    syntax: '**bold text**\n*italic text*\n***bold and italic***\n~~strikethrough~~',
  },
  {
    title: 'Inline code',
    syntax: 'Use `backticks` for inline code.',
  },
  {
    title: 'Links',
    syntax: '[Link text](https://example.com)\n\n<https://example.com>',
  },
  {
    title: 'Images',
    syntax: '![Alt text](https://placehold.co/120x60)',
  },
  {
    title: 'Unordered list',
    syntax: '- First item\n- Second item\n  - Nested item\n  - Another nested\n- Third item',
  },
  {
    title: 'Ordered list',
    syntax: '1. First\n2. Second\n3. Third',
  },
  {
    title: 'Task list',
    syntax: '- [x] Done\n- [ ] Not done\n- [ ] Another task',
  },
  {
    title: 'Blockquote',
    syntax: '> A quoted line.\n> Continues here.\n>\n> > Nested quote.',
  },
  {
    title: 'Code block',
    syntax: '```js\nfunction hello() {\n  console.log("hi");\n}\n```',
  },
  {
    title: 'Table',
    syntax: '| Name  | Score |\n| ----- | ----: |\n| Alice |   42  |\n| Bob   |   17  |',
  },
  {
    title: 'Horizontal rule',
    syntax: 'Above\n\n---\n\nBelow',
  },
  {
    title: 'Line break',
    syntax: 'End a line with two spaces  \nfor a hard break.',
  },
  {
    title: 'Escaping',
    syntax: 'Use a backslash to escape: \\*not italic\\*',
  },
];

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function openChangelog() {
  changelogBackdrop.classList.remove('hidden');
}
function closeChangelog() {
  changelogBackdrop.classList.add('hidden');
}
openChangelogBtn.addEventListener('click', openChangelog);
changelogClose.addEventListener('click', closeChangelog);
changelogBackdrop.addEventListener('click', (e) => {
  if (e.target === changelogBackdrop) closeChangelog();
});

function parseChangelog(md) {
  const lines = md.split('\n');
  const entries = [];
  let current = null;
  let currentSection = null;

  for (const line of lines) {
    const versionMatch = line.match(/^##\s+\[([^\]]+)\]\s*(?:-\s*(.+?))?\s*$/);
    if (versionMatch) {
      if (current) entries.push(current);
      current = {
        version: versionMatch[1],
        date: (versionMatch[2] || '').trim(),
        sections: {},
      };
      currentSection = null;
      continue;
    }
    const sectionMatch = line.match(/^###\s+(.+?)\s*$/);
    if (sectionMatch && current) {
      currentSection = sectionMatch[1].trim();
      current.sections[currentSection] = current.sections[currentSection] || [];
      continue;
    }
    const itemMatch = line.match(/^\s*[-*]\s+(.+?)\s*$/);
    if (itemMatch && current && currentSection) {
      current.sections[currentSection].push(itemMatch[1]);
    }
  }
  if (current) entries.push(current);

  return entries.filter((e) => {
    const isUnreleased = e.version.toLowerCase() === 'unreleased';
    const hasItems = Object.values(e.sections).some((arr) => arr.length > 0);
    return !isUnreleased || hasItems;
  });
}

async function renderChangelog() {
  const md = (await window.marky?.readChangelog?.()) || '';
  const entries = parseChangelog(md);
  if (entries.length === 0) {
    changelogBody.innerHTML = '<div class="changelog-entry"><em>No changelog entries yet.</em></div>';
    return;
  }
  const firstReleased = entries.find((e) => e.version.toLowerCase() !== 'unreleased');
  const currentVersion = firstReleased?.version;
  changelogBody.innerHTML = entries.map((entry) => {
    const groups = Object.entries(entry.sections)
      .filter(([, items]) => items.length > 0)
      .map(([label, items]) => `
        <div class="changelog-group">
          <span class="changelog-group-label">${escapeHtml(label)}</span>
          <ul class="changelog-list">
            ${items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
          </ul>
        </div>
      `).join('');
    const isUnreleased = entry.version.toLowerCase() === 'unreleased';
    const isCurrent = entry.version === currentVersion;
    const versionLabel = isUnreleased ? 'Unreleased' : `v${entry.version}`;
    return `
      <section class="changelog-entry">
        <div class="changelog-version-row">
          <span class="changelog-version${isCurrent ? ' current' : ''}">${escapeHtml(versionLabel)}</span>
          <span class="changelog-date">${escapeHtml(entry.date)}</span>
        </div>
        ${groups}
      </section>
    `;
  }).join('');
}
renderChangelog();

(async () => {
  const v = await window.marky?.getAppVersion?.();
  if (v) {
    const el = document.getElementById('versionNumber');
    if (el) el.textContent = `v${v}`;
  }
})();

function renderGuide() {
  guideBody.innerHTML = GUIDE_SECTIONS.map((item) => {
    const rendered = DOMPurify.sanitize(marked.parse(item.syntax));
    return `
      <section class="guide-section">
        <h3>${item.title}</h3>
        <div class="guide-row">
          <pre class="guide-syntax"><code>${escapeHtml(item.syntax)}</code></pre>
          <div class="guide-rendered markdown-body">${rendered}</div>
        </div>
      </section>
    `;
  }).join('');
}
renderGuide();

const SETTINGS_KEY = 'marky:settings:v1';
const defaultSettings = {
  theme: 'marky',
  fontSize: 14,
  previewSize: 15,
  view: 'split',
  wordWrap: true,
  customChain: '',
};

const CUSTOM_SLOT_VARS = [
  '--bg',
  '--bg-elev',
  '--topbar-bg',
  '--fg',
  '--fg-muted',
  '--accent',
  '--border',
  '--code-bg',
];

const THEME_PRESETS = {
  aubergine: '#3F0E40,#350D36,#522653,#F8F8F8,#BCABBC,#1264A3,#522653,#2C0B2D',
  hoth:      '#F8F8F8,#FFFFFF,#FFFFFF,#1D1C1D,#696969,#1264A3,#E1E1E1,#F0F0F0',
  monument:  '#0F1B2D,#15243B,#0B1626,#E8EAF1,#8A93A6,#37C8AB,#1F2D44,#142036',
  brink:     '#0E2439,#0A1C2E,#081625,#E6EAF0,#7E8FA3,#FFB938,#1A3552,#0F2236',
  nord:      '#2E3440,#3B4252,#242933,#ECEFF4,#A6ADBB,#88C0D0,#434C5E,#3B4252',
  solarized: '#002B36,#073642,#001E27,#EEE8D5,#93A1A1,#B58900,#0E4651,#073642',
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...defaultSettings, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

function parseHex(token) {
  let h = token.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return `#${h.toLowerCase()}`;
}

function parseChain(raw) {
  if (!raw) return { ok: false, colors: [], error: '' };
  const tokens = raw.split(/[,\s]+/).filter(Boolean);
  if (tokens.length !== CUSTOM_SLOT_VARS.length) {
    return {
      ok: false,
      colors: [],
      error: `Need exactly ${CUSTOM_SLOT_VARS.length} colors (got ${tokens.length}).`,
    };
  }
  const colors = [];
  for (let i = 0; i < tokens.length; i++) {
    const parsed = parseHex(tokens[i]);
    if (!parsed) {
      return { ok: false, colors: [], error: `Invalid hex at position ${i + 1}: "${tokens[i]}"` };
    }
    colors.push(parsed);
  }
  return { ok: true, colors, error: '' };
}

function clearCustomVars() {
  for (const v of CUSTOM_SLOT_VARS) {
    document.documentElement.style.removeProperty(v);
  }
}

function applyCustomChain(raw) {
  const result = parseChain(raw);
  customChainError.textContent = result.error;
  customChainInput.classList.toggle('invalid', !!raw && !result.ok);
  if (result.ok) {
    result.colors.forEach((c, i) => {
      document.documentElement.style.setProperty(CUSTOM_SLOT_VARS[i], c);
    });
    updateSwatches(result.colors);
  } else {
    clearCustomVars();
    updateSwatches([]);
  }
  return result.ok;
}

function updateSwatches(colors) {
  customSwatches.forEach((el, i) => {
    el.style.background = colors[i] || '';
  });
}

function applySettings(s) {
  document.documentElement.setAttribute('data-theme', s.theme);
  document.documentElement.style.setProperty('--editor-font-size', `${s.fontSize}px`);
  document.documentElement.style.setProperty('--preview-font-size', `${s.previewSize}px`);
  editor.classList.toggle('nowrap', !s.wordWrap);
  customThemeBlock.classList.toggle('hidden', s.theme !== 'custom');
  if (s.theme === 'custom') {
    applyCustomChain(s.customChain || '');
  } else {
    clearCustomVars();
    customChainError.textContent = '';
    customChainInput.classList.remove('invalid');
  }
}

let settings = loadSettings();
applySettings(settings);

settingTheme.value = settings.theme;
settingFontSize.value = settings.fontSize;
settingPreviewSize.value = settings.previewSize;
settingWordWrap.checked = settings.wordWrap;

setView(settings.view);

function bindSetting(el, key, parser = (v) => v) {
  el.addEventListener('change', () => {
    const value = el.type === 'checkbox' ? el.checked : parser(el.value);
    settings = { ...settings, [key]: value };
    saveSettings(settings);
    applySettings(settings);
  });
}
bindSetting(settingTheme, 'theme');
bindSetting(settingFontSize, 'fontSize', (v) => Number(v) || defaultSettings.fontSize);
bindSetting(settingPreviewSize, 'previewSize', (v) => Number(v) || defaultSettings.previewSize);
bindSetting(settingWordWrap, 'wordWrap');

customChainInput.value = settings.customChain || '';

customChainInput.addEventListener('input', () => {
  const value = customChainInput.value;
  settings = { ...settings, customChain: value };
  saveSettings(settings);
  if (settings.theme === 'custom') applyCustomChain(value);
});

presetChips.forEach((chip) => {
  chip.addEventListener('click', () => {
    const chain = THEME_PRESETS[chip.dataset.preset];
    if (!chain) return;
    customChainInput.value = chain;
    settings = { ...settings, theme: 'custom', customChain: chain };
    saveSettings(settings);
    settingTheme.value = 'custom';
    applySettings(settings);
  });
});

copyCurrentBtn.addEventListener('click', async () => {
  const styles = getComputedStyle(document.documentElement);
  const chain = CUSTOM_SLOT_VARS.map((v) => {
    const raw = styles.getPropertyValue(v).trim();
    return cssColorToHex(raw) || raw;
  }).join(',');
  customChainInput.value = chain;
  try {
    await navigator.clipboard.writeText(chain);
    const original = copyCurrentBtn.textContent;
    copyCurrentBtn.textContent = 'Copied!';
    setTimeout(() => { copyCurrentBtn.textContent = original; }, 1200);
  } catch {}
  settings = { ...settings, customChain: chain };
  saveSettings(settings);
});

function cssColorToHex(value) {
  if (!value) return null;
  if (value.startsWith('#')) return parseHex(value);
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
  if (parts.length < 3) return null;
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
}

let dragging = false;
divider.addEventListener('mousedown', (e) => {
  dragging = true;
  e.preventDefault();
  document.body.style.cursor = 'col-resize';
});
window.addEventListener('mousemove', (e) => {
  if (!dragging) return;
  const total = document.querySelector('.app').clientWidth;
  const leftWidth = Math.max(120, Math.min(total - 120, e.clientX));
  editorPane.style.flex = `0 0 ${leftWidth}px`;
  previewPane.style.flex = '1 1 0';
});
window.addEventListener('mouseup', () => {
  if (dragging) {
    dragging = false;
    document.body.style.cursor = '';
  }
});

window.marky?.requestFileState().then((state) => {
  if (state) {
    currentFilePath = state.filePath;
    setFilename(state.displayName);
  }
});

editor.value = '# Welcome to Marky\n\nStart typing **Markdown** on the left, see it rendered on the right.\n\n- Lists work\n- `inline code` too\n- [Links open externally](https://example.com)\n\n```js\nconsole.log("Hello, Marky!");\n```\n';
lastSavedContent = editor.value;
render();
