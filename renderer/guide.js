export const GUIDE_SECTIONS = [
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
  {
    title: 'Presentation slides',
    syntax: '---\nheader: My Talk\npaginate: true\ntheme: marky\n---\n\n<!-- layout: title -->\n# Slide 1\n\n## Subtitle\n\n---\n\n# Regular slide\n\nLayouts: title, section, quote, image, code',
  },
  {
    title: 'Slide styling directives',
    syntax: '<!-- bg: accent -->\n<!-- accent: #ffffff -->\n<!-- invert -->\n<!-- bg-image: https://example.com/hero.jpg -->\n\nColors accept hex/rgb or theme tokens:\nbg, surface, fg, muted, accent, border, code',
  },
];
