# Insulae Incognita development notes

Insulae Incognita builds scrolling terrain from multilingual glyphs. `index.html` generates terrain and translates its glyphs; `index_typing.html` maps typed letters to terrain, and `index_combined.html` overlays typing on generated terrain.

## Next in development

Evaluate scrolling typed lines before deciding whether completed lines should enter the translation process.

## 2026-10-05 — Codex — Playback for typed lines

Added **Play** and **Pause** to `index_typing.html`. The page starts paused. The active line stays fixed, and Enter or wrapping after 30 cells submits a completed line. During playback, completed lines scroll upward at one line height per second and leave the field. Submitting a line makes room for it even while paused. Backspace on an empty active line restores the most recent retained line. The background colors advance during playback. Typing is scoped to the focusable surface so the button retains Enter and Space activation and modifier shortcuts don't insert terrain.

Checked the page in the Codex browser at 504 × 836: DOM coordinates changed for completed lines during playback while the active line's position stayed fixed; coordinates stayed unchanged across paused observations. Keyboard Space toggled the button without adding a cell. Checked Enter, automatic wrapping on the 31st character, backspace deletion and line recovery, and removal after lines scrolled out. A 30-cell rainforest line initially measured 520.8 px in a 440.8 px field; after constraining the font size, it measured 407.8 px and fit. The browser reported no JavaScript errors, `node --check typerEngine.js` passed, and `git diff --check` passed.

Kept this change in the typing-only version after Xyh selected completed lines scrolling away. The combined prototype still needs its overlay advancement repaired: `onSync()` only shifts data when the terrain's line count grows, so it stops advancing at 30 rows; it also clamps the intended fixed cursor row during startup. That repair was deferred because it is a separate interaction. Mobile software keyboard input and pasted text are not supported by the typing surface. No separate pre-existing development notes were found. The expanded PDF manual could not be extracted with `library/scripts/pdf_to_markdown.py` because the available Python environments lacked PyMuPDF; the HTML manual and code comments supplied the existing scrolling behavior.
