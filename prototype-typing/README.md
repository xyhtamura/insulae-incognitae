# Typing prototype snapshot

Open [the original typing page](../index_typing.html). It stays separate from [Sulat](../sulat/index.html).

The page and JavaScript were restored from repository commit `f2723fa`, the last typing version before the Sulat folder split. The page changes only its script URLs to load this directory. Its original title, controls, and behavior remain: the earlier letter palette, stepped playback, translation, biome contact, and flying birds. It has no Sulat title screen or land animals.

The JavaScript and seven regression cases are preserved copies, rather than imports from the active parent or Sulat scripts. The page still uses the existing `../fonts/NotoSansTagalog-Regular.ttf` and Google Fonts links. Font provenance and license are recorded in [the parent asset record](../ASSETS.md).

From `F:/xyh`, run:

```sh
node --test insulae-incognitae/prototype-typing/typingEcology.test.mjs
```

2026-10-05 — Codex — Restored the snapshot and removed the original page's redirect. Opened `index_typing.html` in the browser, typed and submitted terrain, and observed a completed row advance from `1em` to `2em` before pausing. The URL remained on the prototype, its seven scripts loaded from this folder, and the browser reported no errors. All seven restored regression cases passed. Development continues in Sulat; this snapshot retains the earlier mobile keyboard and paste limitations.
