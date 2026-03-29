<div align="center">

# 🗒️ WinStickies

**Mac Stickies. But for Windows. Finally.**

[![Version](https://img.shields.io/badge/version-1.0.1-FFD700?style=flat-square)](https://github.com/piyush-1803/WinStickies/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D4?style=flat-square&logo=windows)](https://github.com/piyush-1803/WinStickies)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-47848F?style=flat-square&logo=electron)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/license-MIT-white?style=flat-square)](LICENSE)

</div>

---

## What is WinStickies?

WinStickies is a native Windows desktop app that replicates the macOS Stickies experience — floating sticky notes that live on your desktop, always visible, always there.

Windows has never had a good native sticky notes app. WinStickies fixes that.

---

## Features

- **Floating sticky notes** — always on top, always visible
- **Multiple notes** — create as many as you need
- **Persistent storage** — notes survive app restarts
- **Drag anywhere** — reposition notes freely on your desktop
- **Resize freely** — make them as big or small as you want
- **Color coding** — pick different colors per note
- **Minimal UI** — no clutter, just your text
- **Lightweight** — launches instantly, sits quietly in your tray

---

## Installation

### Option 1 — Download the installer (recommended)

Download `WinStickies-Setup.exe` from the [Releases](https://github.com/piyush-1803/WinStickies/releases) page and run it.

### Option 2 — Run from source
```bash
git clone https://github.com/piyush-1803/WinStickies.git
cd WinStickies
npm install
npm start
```

**Requirements:** Node.js 18+ and npm.

---

## Tech Stack

- [Electron](https://www.electronjs.org/) — cross-platform desktop runtime
- [Electron Forge](https://www.electronforge.io/) — packaging and distribution
- HTML / CSS / Vanilla JS
- `app.getPath("userData")` — persistent local storage for notes

---

## Changelog

### v1.0.1
- Fixed ENOENT/asar path bug — notes now persist correctly using `app.getPath("userData")`

### v1.0.0
- Initial release — floating sticky notes for Windows

---

## Roadmap

- [ ] Rich text formatting (bold, italic, lists)
- [ ] System tray with quick-create note
- [ ] Dark mode
- [ ] Font size controls
- [ ] Export notes to .txt

---

## Author

Built by [piyush-1803](https://github.com/piyush-1803) — 18-year-old gap year student, Patratu, Jharkhand.

---

<div align="center">
<sub>If you switched from Mac and missed Stickies, this one's for you. Give it a ⭐</sub>
</div>
