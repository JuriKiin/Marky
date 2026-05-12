# Marky

A simple, offline-first Markdown editor for macOS. Built with Electron.

<p align="center">
  <img src="build/icon.png" alt="Marky logo" width="128" />
</p>

<img width="1312" height="912" alt="Screenshot 2026-05-12 at 10 13 56 AM" src="https://github.com/user-attachments/assets/38495572-d7a7-498a-9270-2991a57e588e" />

## Features

- Split editor / live preview with GitHub-flavored Markdown
- Renameable filename in the header — commits to disk
- Three-way view toggle (Editor / Split / Preview) with ⌘1, ⌘2, ⌘3
- Custom themes — paste an 8-hex color chain like Slack (with presets)
- Built-in Markdown reference guide (⌘/)
- Persisted settings: theme, fonts, word wrap, view
- macOS integration — right-click → Open With Marky, dock-icon drag, "Recent Documents"

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
  index.html                     # Topbar + editor/preview panes + modals
  renderer.js                    # Live preview, settings, themes, changelog parser
  styles.css                     # CSS variables drive theming
CHANGELOG.md                     # Source of truth for in-app changelog
build/
  icon.png / icon.icns           # App icon source + generated macOS bundle icon
  make-icns.sh                   # PNG → ICNS conversion (sips + iconutil)
scripts/
  promote-changelog.mjs          # Used by the release workflow
  extract-release-notes.mjs      # Used by the release workflow
.github/workflows/release.yml    # Manual-trigger release pipeline
```

## Tech

- [Electron](https://www.electronjs.org/) — desktop runtime
- [marked](https://marked.js.org/) — Markdown → HTML
- [DOMPurify](https://github.com/cure53/DOMPurify) — sanitization
- [electron-builder](https://www.electron.build/) — packaging + GitHub publishing

## License

MIT — see [LICENSE](LICENSE).
