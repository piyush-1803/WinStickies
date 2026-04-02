# Changelog

## [2.0.0] - 2026-04-02

### Added
- **Tools Sidebar** — hover over the left edge of any note to reveal the tools panel. Click the toggle to lock it open.
- **Text Formatting** — Bold, Italic, Underline, Highlight, and Clear Formatting buttons for selected text. Formatting persists across restarts.
- **Bullet List** — insert a bullet point at cursor position with one click.
- **Checkbox** — insert a checkbox (☐) at cursor. Click any checkbox in the note to toggle it (☐ ↔ ☑).
- **Pomodoro Timer** — built-in 25-minute focus timer with automatic 5-minute break. Click the display to set a custom duration (1–120 min). Plays a chime when time is up.
- **Save Button** — yellow dot now explicitly saves the note with a green flash confirmation.
- **Auto-start** — WinStickies now launches automatically when Windows boots.
- **Resize Handle** — drag the bottom-right corner to resize any note window freely.
- **Minimum window size** — notes cannot be resized smaller than 200×120px.

### Changed
- Closing a note (red X) now **permanently deletes** it. Deleted notes never reappear after restart.
- Note content now saves as HTML internally, preserving all rich text formatting.
- Window is always resizable regardless of state.

### Fixed
- Pomodoro duration input now uses inline editing instead of browser prompt (which did not work in Electron).
- Tools panel auto-closes after using a formatting tool so you can see changes immediately.

## [1.0.0] - 2026-02-04

### Added
- Initial release — frameless sticky notes for Windows.
- Multiple notes with independent windows.
- Color picker (yellow, green, blue, pink, purple, gray).
- Always-on-top (pin) toggle.
- Translucent mode.
- Collapse to title bar.
- Auto-save on typing.
- System tray icon with New Note and Quit options.
- Squirrel installer via Electron Forge.
