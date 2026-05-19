export const KNOWN_LAYOUTS = ['default', 'title', 'section', 'quote', 'image', 'code'];
export const KNOWN_DECK_THEMES = ['marky', 'system', 'light', 'dark'];

export const THEME_TOKENS = {
  bg: 'var(--bg)',
  surface: 'var(--bg-elev)',
  topbar: 'var(--topbar-bg)',
  fg: 'var(--fg)',
  muted: 'var(--fg-muted)',
  accent: 'var(--accent)',
  border: 'var(--border)',
  code: 'var(--code-bg)',
};

export const SLIDE_TEMPLATES = [
  {
    id: 'default',
    label: 'Default',
    shortcut: '⌘⇧N',
    thumb: 'default',
    md: '# Heading\n\nContent here.',
  },
  {
    id: 'title',
    label: 'Title',
    thumb: 'title',
    md: '<!-- layout: title -->\n# Big Idea\n\n## A short subtitle',
  },
  {
    id: 'section',
    label: 'Section divider',
    thumb: 'section',
    md: '<!-- layout: section -->\n# Section',
  },
  {
    id: 'bullets',
    label: 'Bullets',
    thumb: 'bullets',
    md: '# Headline\n\n- First point\n- Second point\n- Third point',
  },
  {
    id: 'quote',
    label: 'Quote',
    thumb: 'quote',
    md: '<!-- layout: quote -->\n> "A memorable quote."\n>\n> — Attribution',
  },
  {
    id: 'image',
    label: 'Image',
    thumb: 'image',
    md: '<!-- layout: image -->\n![Alt text](https://placehold.co/1200x700)\n\nCaption text',
  },
  {
    id: 'code',
    label: 'Code',
    thumb: 'code',
    md: '<!-- layout: code -->\n# Example\n\n```js\nfunction hello() {\n  return "world";\n}\n```',
  },
  {
    id: 'closing',
    label: 'Closing',
    thumb: 'closing',
    md: '<!-- layout: title -->\n# Thanks!\n\n## Questions?',
  },
];

export const THUMB_SVGS = {
  default: '<rect x="2" y="3" width="20" height="14" rx="2" /><line x1="5" y1="7" x2="15" y2="7" /><line x1="5" y1="10" x2="19" y2="10" /><line x1="5" y1="12.5" x2="19" y2="12.5" /><line x1="5" y1="15" x2="13" y2="15" />',
  title: '<rect x="2" y="3" width="20" height="14" rx="2" /><line x1="6" y1="9" x2="18" y2="9" stroke-width="2.2" /><line x1="8" y1="13" x2="16" y2="13" />',
  section: '<rect x="2" y="3" width="20" height="14" rx="2" fill="currentColor" stroke="none" opacity="0.85" /><line x1="6" y1="10" x2="18" y2="10" stroke="var(--bg-elev)" stroke-width="2" />',
  bullets: '<rect x="2" y="3" width="20" height="14" rx="2" /><line x1="5" y1="7" x2="13" y2="7" /><circle cx="6" cy="10.5" r="0.7" fill="currentColor" stroke="none" /><line x1="8" y1="10.5" x2="18" y2="10.5" /><circle cx="6" cy="13" r="0.7" fill="currentColor" stroke="none" /><line x1="8" y1="13" x2="17" y2="13" /><circle cx="6" cy="15.5" r="0.7" fill="currentColor" stroke="none" /><line x1="8" y1="15.5" x2="16" y2="15.5" />',
  quote: '<rect x="2" y="3" width="20" height="14" rx="2" /><path d="M7 8 v3 a1.5 1.5 0 0 0 1.5 1.5 M11 8 v3 a1.5 1.5 0 0 0 1.5 1.5" stroke-width="1.4" /><line x1="6" y1="14.5" x2="18" y2="14.5" />',
  image: '<rect x="2" y="3" width="20" height="14" rx="2" /><rect x="5" y="6" width="14" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.45" /><circle cx="8" cy="9" r="1" fill="var(--bg-elev)" stroke="none" /><path d="M5 13 l3.5 -3.5 l3 3 l2.5 -2 l5 4" stroke="var(--bg-elev)" stroke-width="0.8" fill="none" />',
  code: '<rect x="2" y="3" width="20" height="14" rx="2" /><rect x="5" y="6" width="14" height="8" rx="1" fill="currentColor" stroke="none" opacity="0.3" /><polyline points="9,8.5 7,10 9,11.5" stroke-width="1.2" /><polyline points="15,8.5 17,10 15,11.5" stroke-width="1.2" /><line x1="11" y1="11.5" x2="13" y2="8.5" stroke-width="1.2" />',
  closing: '<rect x="2" y="3" width="20" height="14" rx="2" /><line x1="6" y1="9" x2="18" y2="9" stroke-width="2.2" /><line x1="9" y1="13" x2="15" y2="13" />',
};

export function parseFrontmatter(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/);
  if (!m) return { config: {}, body: md };
  const config = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^\s*([a-zA-Z_][\w-]*)\s*:\s*(.+?)\s*$/);
    if (!kv) continue;
    let val = kv[2].trim().replace(/^['"]|['"]$/g, '');
    if (val === 'true') val = true;
    else if (val === 'false') val = false;
    config[kv[1]] = val;
  }
  return { config, body: md.slice(m[0].length) };
}

export function splitSlides(md) {
  const { config, body } = parseFrontmatter(md);
  const lines = body.split('\n');
  const slides = [];
  let current = [];
  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) inFence = !inFence;
    if (!inFence && /^---\s*$/.test(line)) {
      slides.push(current.join('\n'));
      current = [];
      continue;
    }
    current.push(line);
  }
  slides.push(current.join('\n'));
  const cleaned = slides.map((s) => s.replace(/^\s+|\s+$/g, '')).filter((s) => s.length > 0);
  return { config, slides: cleaned };
}

export function extractDirectives(slideMd) {
  const directives = {};
  let body = slideMd;
  while (true) {
    const m = body.match(/^\s*<!--\s*([\w-]+)(?:\s*:\s*([^>]*?))?\s*-->\s*\n?/);
    if (!m) break;
    const key = m[1].toLowerCase();
    const value = (m[2] || '').trim();
    directives[key] = value === '' ? true : value;
    body = body.slice(m[0].length);
  }
  return { directives, body };
}

export function safeColor(s) {
  if (typeof s !== 'string') return null;
  const v = s.trim();
  const token = THEME_TOKENS[v.toLowerCase()];
  if (token) return token;
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v;
  if (/^rgba?\(\s*[\d.,\s%]+\s*\)$/.test(v)) return v;
  if (/^hsla?\(\s*[\d.,\s%]+\s*\)$/.test(v)) return v;
  if (/^[a-z]+$/i.test(v)) return v;
  return null;
}

export function safeImageUrl(s) {
  if (typeof s !== 'string') return null;
  const v = s.trim().replace(/^url\((.*)\)$/i, '$1').replace(/^['"]|['"]$/g, '');
  if (/[\s"'<>;]/.test(v)) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^data:image\//i.test(v)) return v;
  if (/^file:\/\//i.test(v)) return v;
  if (/^[\w./-]+$/.test(v)) return v;
  return null;
}
