export const CUSTOM_SLOT_VARS = [
  '--bg',
  '--bg-elev',
  '--topbar-bg',
  '--fg',
  '--fg-muted',
  '--accent',
  '--border',
  '--code-bg',
];

export const THEME_PRESETS = {
  aubergine: '#3F0E40,#350D36,#522653,#F8F8F8,#BCABBC,#1264A3,#522653,#2C0B2D',
  hoth:      '#F8F8F8,#FFFFFF,#FFFFFF,#1D1C1D,#696969,#1264A3,#E1E1E1,#F0F0F0',
  monument:  '#0F1B2D,#15243B,#0B1626,#E8EAF1,#8A93A6,#37C8AB,#1F2D44,#142036',
  brink:     '#0E2439,#0A1C2E,#081625,#E6EAF0,#7E8FA3,#FFB938,#1A3552,#0F2236',
  nord:      '#2E3440,#3B4252,#242933,#ECEFF4,#A6ADBB,#88C0D0,#434C5E,#3B4252',
  solarized: '#002B36,#073642,#001E27,#EEE8D5,#93A1A1,#B58900,#0E4651,#073642',
};

export function parseHex(token) {
  let h = token.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]+$/.test(h)) return null;
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6) return null;
  return `#${h.toLowerCase()}`;
}

export function parseChain(raw) {
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

export function cssColorToHex(value) {
  if (!value) return null;
  if (value.startsWith('#')) return parseHex(value);
  const m = value.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const parts = m[1].split(',').map((p) => parseFloat(p.trim()));
  if (parts.length < 3) return null;
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(parts[0])}${toHex(parts[1])}${toHex(parts[2])}`;
}
