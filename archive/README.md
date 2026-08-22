# archive

Frozen earlier versions. Not loaded by any live page. Do not edit; do not use as
a base for new work.

## opi-2025-08

The state of the work at 2025-08-05, before the `lexicon.js` refactor. It has no
`lexicon.js` at all — `translationModule.js` there recognises words a different
way, so it is a different design rather than an older copy of the current one.

Its JavaScript is UTF-16 rather than UTF-8, and inconsistently: `glyphData.js` is
little-endian, `translationModule.js` is big-endian. Most editors will silently
re-encode these on save, so treat the files as read-only. `iconv -f UTF-16LE -t
UTF-8` (or `-f UTF-16BE`) if you need to read one.

Kept for reference on the pre-lexicon translation approach and for `pang.html`,
which exists nowhere else.
