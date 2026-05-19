import { marked } from '../node_modules/marked/lib/marked.esm.js';
import DOMPurify from '../node_modules/dompurify/dist/purify.es.mjs';
import {
  KNOWN_LAYOUTS,
  KNOWN_DECK_THEMES,
  SLIDE_TEMPLATES,
  THUMB_SVGS,
  splitSlides,
  extractDirectives,
  safeColor,
  safeImageUrl,
} from './slides.js';
import {
  CUSTOM_SLOT_VARS,
  THEME_PRESETS,
  parseHex,
  parseChain,
  cssColorToHex,
} from './themes.js';
import { parseChangelog } from './changelog.js';
import { GUIDE_SECTIONS } from './guide.js';

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
const addSlideBtn = document.getElementById('addSlideBtn');
const templatesPopover = document.getElementById('templatesPopover');
const templatesList = document.getElementById('templatesList');
const presentBtn = document.getElementById('presentBtn');
const presentOverlay = document.getElementById('presentOverlay');
const slideCanvas = document.getElementById('slideCanvas');
const presentHeader = document.getElementById('presentHeader');
const presentFooter = document.getElementById('presentFooter');
const presentPage = document.getElementById('presentPage');

let lastSavedContent = '';
let isDirty = false;
let currentFilePath = null;
let currentDisplayName = 'Untitled.md';

marked.setOptions({ gfm: true, breaks: false });

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

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
    if (!templatesPopover.classList.contains('hidden')) closeTemplatesPopover();
  }
});

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
    const body = groups || '<p class="changelog-empty">No notable changes.</p>';
    return `
      <section class="changelog-entry">
        <div class="changelog-version-row">
          <span class="changelog-version${isCurrent ? ' current' : ''}">${escapeHtml(versionLabel)}</span>
          <span class="changelog-date">${escapeHtml(entry.date)}</span>
        </div>
        ${body}
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

function renderTemplateList() {
  templatesList.innerHTML = SLIDE_TEMPLATES.map((t) => `
    <li>
      <button type="button" class="template-item" data-template-id="${t.id}">
        <svg class="template-thumb" viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${THUMB_SVGS[t.thumb] || THUMB_SVGS.default}</svg>
        <span class="template-label">${t.label}</span>
        ${t.shortcut ? `<span class="template-shortcut">${t.shortcut}</span>` : ''}
      </button>
    </li>
  `).join('');
}
renderTemplateList();

function insertSlide(idOrTemplate) {
  const template = typeof idOrTemplate === 'string'
    ? SLIDE_TEMPLATES.find((t) => t.id === idOrTemplate)
    : idOrTemplate;
  if (!template) return;

  const content = editor.value;
  const trimmedEnd = content.replace(/\s+$/, '');
  const separator = trimmedEnd.length === 0 ? '' : '\n\n---\n\n';
  const insertStart = trimmedEnd.length + separator.length;
  editor.value = trimmedEnd + separator + template.md + '\n';

  editor.dispatchEvent(new Event('input'));
  editor.focus();
  editor.setSelectionRange(insertStart, insertStart);

  const before = editor.value.slice(0, insertStart);
  const lineCount = (before.match(/\n/g) || []).length;
  const lineHeight = parseFloat(getComputedStyle(editor).lineHeight) || 22;
  editor.scrollTop = Math.max(0, lineCount * lineHeight - editor.clientHeight / 2);
}

function positionTemplatesPopover() {
  const rect = addSlideBtn.getBoundingClientRect();
  templatesPopover.style.top = `${rect.bottom + 6}px`;
  templatesPopover.style.right = `${Math.max(8, window.innerWidth - rect.right)}px`;
}

function openTemplatesPopover() {
  positionTemplatesPopover();
  templatesPopover.classList.remove('hidden');
}
function closeTemplatesPopover() {
  templatesPopover.classList.add('hidden');
}

addSlideBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (templatesPopover.classList.contains('hidden')) openTemplatesPopover();
  else closeTemplatesPopover();
});

templatesList.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-template-id]');
  if (!btn) return;
  insertSlide(btn.dataset.templateId);
  closeTemplatesPopover();
});

document.addEventListener('click', (e) => {
  if (templatesPopover.classList.contains('hidden')) return;
  if (templatesPopover.contains(e.target) || addSlideBtn.contains(e.target)) return;
  closeTemplatesPopover();
});

window.addEventListener('resize', () => {
  if (!templatesPopover.classList.contains('hidden')) positionTemplatesPopover();
});

window.marky?.onInsertSlide?.((id) => insertSlide(id));

const presentation = {
  slides: [],
  config: {},
  index: 0,
  savedTheme: null,
};

function renderSlide() {
  const md = presentation.slides[presentation.index] || '';
  const { directives, body } = extractDirectives(md);
  const layout = KNOWN_LAYOUTS.includes(directives.layout) ? directives.layout : 'default';
  const html = DOMPurify.sanitize(marked.parse(body));

  slideCanvas.className = `slide markdown-body slide-layout-${layout}`;
  slideCanvas.removeAttribute('style');

  const styles = [];
  const bg = safeColor(directives.bg);
  if (bg) styles.push(`background-color: ${bg}`);

  const accent = safeColor(directives.accent);
  if (accent) styles.push(`--accent: ${accent}`);

  const bgImage = safeImageUrl(directives['bg-image']);
  if (bgImage) {
    styles.push(`--slide-bg-image: url("${bgImage}")`);
    slideCanvas.classList.add('has-bg-image');
  }

  if (directives.invert) slideCanvas.classList.add('invert');

  if (styles.length) slideCanvas.setAttribute('style', styles.join('; '));

  slideCanvas.innerHTML = html;
  slideCanvas.querySelectorAll('a').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  presentHeader.textContent = presentation.config.header || '';
  presentFooter.textContent = presentation.config.footer || '';
  if (presentation.config.paginate) {
    presentPage.textContent = `${presentation.index + 1} / ${presentation.slides.length}`;
  } else {
    presentPage.textContent = '';
  }
}

function openPresent() {
  const { config, slides } = splitSlides(editor.value);
  if (slides.length === 0) return;
  presentation.config = config;
  presentation.slides = slides;
  presentation.index = 0;

  if (typeof config.theme === 'string' && KNOWN_DECK_THEMES.includes(config.theme)) {
    presentation.savedTheme = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', config.theme);
  } else {
    presentation.savedTheme = null;
  }

  renderSlide();
  presentOverlay.classList.remove('hidden');
  presentOverlay.setAttribute('aria-hidden', 'false');
  document.documentElement.requestFullscreen?.().catch(() => {});
}

function closePresent() {
  if (presentOverlay.classList.contains('hidden')) return;
  if (presentation.savedTheme !== null) {
    if (presentation.savedTheme) {
      document.documentElement.setAttribute('data-theme', presentation.savedTheme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    presentation.savedTheme = null;
  }
  presentOverlay.classList.add('hidden');
  presentOverlay.setAttribute('aria-hidden', 'true');
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function nextSlide() {
  if (presentation.index < presentation.slides.length - 1) {
    presentation.index++;
    renderSlide();
  }
}
function prevSlide() {
  if (presentation.index > 0) {
    presentation.index--;
    renderSlide();
  }
}

presentBtn.addEventListener('click', openPresent);
window.marky?.onOpenPresent?.(openPresent);

slideCanvas.addEventListener('click', nextSlide);

document.addEventListener('keydown', (e) => {
  if (presentOverlay.classList.contains('hidden')) return;
  if (e.key === 'Escape') { closePresent(); return; }
  if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'Home') {
    e.preventDefault();
    presentation.index = 0;
    renderSlide();
  } else if (e.key === 'End') {
    e.preventDefault();
    presentation.index = presentation.slides.length - 1;
    renderSlide();
  }
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && !presentOverlay.classList.contains('hidden')) {
    closePresent();
  }
});

editor.value = `---
header: Marky Demo
footer: 2026
paginate: true
---

<!-- layout: title -->
# Welcome to Marky

## Markdown slides, beautifully styled

---

<!-- layout: section -->
# Layouts

---

# Default layout

Top-aligned, left-aligned, regular typography. Great for body content with mixed elements.

- Lists
- \`inline code\`
- [links](https://example.com)

---

<!-- layout: quote -->
> "Markdown is the friend of the writer."
>
> — Anonymous

---

<!-- layout: code -->
# Code layout

\`\`\`js
function hello() {
  console.log("Marky!");
}
\`\`\`

---

<!-- bg: accent -->
<!-- accent: #ffffff -->
# Per-slide background

Use theme tokens (\`accent\`, \`fg\`, \`muted\`…) or any hex/rgb color in directives.

---

<!-- invert -->
# Inverted slide

Flip foreground and background with \`<!-- invert -->\`. Great for emphasis.

---

<!-- bg-image: https://images.unsplash.com/photo-1506905925346-21bda4d32df4 -->
# Background image

Use \`<!-- bg-image: url -->\` for hero slides. An overlay keeps text readable.

---

<!-- layout: title -->
# Thanks!

## Press Esc to exit
`;
lastSavedContent = editor.value;
render();
