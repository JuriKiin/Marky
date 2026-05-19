export function parseChangelog(md) {
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
