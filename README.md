# Marky

A simple, offline-first Markdown editor for macOS with a built-in **presentation mode**. Built with Electron.

<p align="center">
  <img src="build/icon.png" alt="Marky logo" width="128" />
</p>

<img width="1312" height="912" alt="Screenshot 2026-05-12 at 10 13 56 AM" src="https://github.com/user-attachments/assets/38495572-d7a7-498a-9270-2991a57e588e" />

## Features

### Editing
- Split editor / live preview with GitHub-flavored Markdown
- Renameable filename in the header — commits to disk
- Three-way view toggle (Editor / Split / Preview) with ⌘1, ⌘2, ⌘3
- Persisted settings: theme, fonts, word wrap, view

### Theming
- Several built-in themes (Marky, System, Light, Dark) plus a **Custom** mode where you paste an 8-hex color chain like Slack
- Six color presets (Aubergine, Hoth, Monument, Brink, Nord, Solarized) and a "Copy current" helper to share themes

### Presentations
- Turn any document into a slide deck — `---` separates slides
- Optional YAML frontmatter at the top configures `header`, `footer`, `paginate`, and `theme`
- **Layouts** via per-slide directives: `<!-- layout: title -->` / `section` / `quote` / `image` / `code`
- **Per-slide styling** directives: `<!-- bg: color -->`, `<!-- accent: color -->`, `<!-- invert -->`, `<!-- bg-image: url -->`
- Color values accept hex / rgb / named colors or theme **tokens** (`accent`, `fg`, `muted`, `bg`, etc.) so overrides stay in sync with the active theme
- Fullscreen present mode (⌘⏎) with arrow-key navigation
- Slide templates popover (`+` toolbar button) inserts pre-styled slides with the right directives

### Reference & history
- Built-in Markdown guide (⌘/) with side-by-side syntax/result examples
- In-app **Changelog** reads `CHANGELOG.md` from the repo
- Footer reads the app version from `package.json` automatically

### macOS integration
- Right-click → Open With Marky
- Drag a markdown file onto the dock icon
- "Recent Documents" in the File menu

## Install

Grab the latest DMG from the [Releases page](https://github.com/JuriKiin/Marky/releases/latest).

## Develop

Requires Node.js 20+ and macOS.

```bash
npm install
npm start
```

## Build locally

```bash
npm run build-icon            # converts build/icon.png to icon.icns
npm run package               # builds Marky.app + DMG into ./dist (no publish)
```

## Releasing

Releases are automated via GitHub Actions ([.github/workflows/release.yml](.github/workflows/release.yml)).

1. Add notable changes under `## [Unreleased]` in [CHANGELOG.md](CHANGELOG.md) as you merge to `main`
2. Go to **Actions → Release → Run workflow**, pick `patch` / `minor` / `major`
3. The workflow:
   - Bumps the version in `package.json`
   - Promotes the `[Unreleased]` section to a versioned entry in `CHANGELOG.md`
   - Opens an auto-merged PR with both changes
   - Builds DMG + ZIP for arm64 and x64 on a macOS runner
   - Publishes the artifacts to a GitHub Release tagged `vX.Y.Z`, using the changelog section as the release notes

## Project layout

```
main.js                          # Electron main process (windows, menus, IPC, file I/O)
preload.js                       # Sandboxed bridge exposing window.marky

renderer/
  index.html                     # Topbar, editor/preview panes, modals, present overlay
  styles.css                     # Theme variables, layout, slide layouts
  renderer.js                    # DOM and IPC wiring (event handlers, settings UI, present controller)
  slides.js                      # Slide parsing — frontmatter, splitter, directives, templates, sanitizers
  themes.js                      # Custom-theme color-chain parsing and Slack-style presets
  changelog.js                   # CHANGELOG.md → structured entries parser
  guide.js                       # Markdown reference syntax data

CHANGELOG.md                     # Source of truth for in-app changelog and release notes
build/
  icon.png / icon.icns           # App icon source + generated macOS bundle icon
  make-icns.sh                   # PNG → ICNS conversion (sips + iconutil)
scripts/
  promote-changelog.mjs          # Promotes [Unreleased] → versioned section during release
  extract-release-notes.mjs      # Pulls a single version's notes for the GitHub Release body
.github/workflows/release.yml    # Manual-trigger release pipeline
```

## Tech

- [Electron](https://www.electronjs.org/) — desktop runtime
- [marked](https://marked.js.org/) — Markdown → HTML
- [DOMPurify](https://github.com/cure53/DOMPurify) — sanitization
- [electron-builder](https://www.electron.build/) — packaging + GitHub publishing

## License

MIT — see [LICENSE](LICENSE).
