# Changelog

All notable changes to Marky are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/) and uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-05-19

### Added
- Presentation mode — split a document into slides with `---`, optional YAML frontmatter for `header`, `footer`, and `paginate`. Open with the Present toolbar button or ⌘⏎; navigate with arrow keys, exit with Esc.
- Slide layouts — per-slide `<!-- layout: name -->` directive switches the slide between distinct visual styles: Title (hero with accent rule), Section divider (full-bleed accent background), Quote (centered italic with attribution), Image (image-focused with caption), Code (large code block), and Default.
- Slide templates picker — `+` toolbar button opens a popover with thumbnail previews of each layout. Picking one inserts the layout directive plus starter content at the end of the document with proper `---` separators.
- Top-level **Slides** menu — Present, Insert Default Slide (⌘⇧N), and Insert Slide With Layout submenu.
- Per-slide styling directives — `<!-- bg: color -->`, `<!-- accent: color -->`, `<!-- invert -->`, and `<!-- bg-image: url -->` override the look of an individual slide. Colors and URLs are validated to keep slide HTML safe.
- Slide directive colors accept theme tokens (`accent`, `fg`, `bg`, `muted`, `surface`, `border`, `code`) in addition to hex/rgb/named colors, so per-slide overrides stay in sync with the active theme.
- Deck-level `theme:` frontmatter pins a presentation to a specific app theme (marky, light, dark, system) for the duration of Present mode; the previous theme is restored on exit.

### Changed
- Refactored the renderer into focused ES modules: `slides.js` (slide parsing, templates, directive sanitizers), `themes.js` (custom color-chain parsing and presets), `changelog.js` (CHANGELOG.md parser), and `guide.js` (markdown reference data). `renderer.js` is now focused on DOM and IPC wiring.

## [1.0.1] - 2026-05-11

_No notable changes._

## [1.0.0] - 2026-05-11

### Added
- Split editor and live preview with GitHub-flavored markdown rendering.
- Renameable filename in the topbar — commits to the file on disk.
- View toggle (Editor / Split / Preview) with ⌘1, ⌘2, ⌘3 shortcuts.
- Settings panel with theme, font sizes, and word wrap.
- Slack-style custom themes via an 8-hex color chain, with 6 presets and a "Copy current" helper.
- Markdown guide with side-by-side syntax/result examples (⌘/).
- Save dialog defaults to the filename typed in the topbar for new files.
- macOS file associations — right-click → Open With Marky, and drag onto the dock icon.
- Marky color scheme using the brand colors, set as the default theme.
