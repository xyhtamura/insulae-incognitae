// translationModule.js
//
// A SECOND PROCESS that reads the glyph stream produced by lineGenerator and
// rewrites it. It knows nothing about terrain — it only sees each cell's `char`
// (looked up in GLYPH_DATA / LEXICON) and rewrites runs of chars, inheriting the
// cell's `className` so the land keeps its colour while its language mutates.
//
// THREE INDEPENDENT MOVES, each gated by its own probability:
//
//   1. semantic   a recognised word -> another language's word for the SAME
//                 meaning. Form changes, meaning kept.      木 -> puno -> ป่า
//
//   2. decompose  one SYLLABLE of a recognised word also BEGINS another word,
//                 so that word is spliced in, in ITS script. Meaning corrupts,
//                 scripts collide.  This is the malfunction. gubat -> gu·basa·t
//
//   3. compose    adjacent loose syllables happen to spell a word, so they fuse
//                 into it (the manual's  ba + sa = basa ).
//
// THE ONE RULE THAT MAKES IT CASCADE: every glyph any move can OUTPUT must also
// be readable (have a phoneme/meaning in GLYPH_DATA, or live in a LEXICON word).
// The system is "closed under translation", so this tick's mess is next tick's
// input — chains emerge on their own, without being scripted.

class TranslationEngine {
    constructor() {
        this.lexicon = (typeof LEXICON !== 'undefined') ? LEXICON : [];

        // ----- tuning knobs -------------------------------------------------
        this.SCAN_CHANCE = 0.05;  // per cell, chance the engine even looks here
        this.P_SEMANTIC  = 0.45;  // given a look, chance to try a semantic hop
        this.P_DECOMPOSE = 0.55;  // ...a decomposition (the mess)
        this.P_COMPOSE   = 0.35;  // ...composing adjacent loose syllables
        this.MAX_COMPOSE = 3;     // most adjacent syllables a compose will fuse
        // --------------------------------------------------------------------

        this.buildIndexes();
    }

    // ---- precompute lookups from the lexicon ----
    buildIndexes() {
        this.byMeaning   = {};  // meaning        -> [word]
        this.byFirstPhon = {};  // first syllable -> [word]   (decompose targets)
        this.byPhonSeq   = {};  // 'ba|sa'        -> [word]   (compose targets)
        for (const w of this.lexicon) {
            const phons = w.syllables.map(s => s.p);
            const m = w.meaning, f = phons[0], k = phons.join('|');
            if (!this.byMeaning[m])   this.byMeaning[m]   = [];
            if (!this.byFirstPhon[f]) this.byFirstPhon[f] = [];
            if (!this.byPhonSeq[k])   this.byPhonSeq[k]   = [];
            this.byMeaning[m].push(w);
            this.byFirstPhon[f].push(w);
            this.byPhonSeq[k].push(w);
        }
    }

    glyphsOf(w) { return w.syllables.reduce((a, s) => a.concat(s.g), []); }
    cell(char, className) { return { char: char, className: className }; }
    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    // every lexicon word whose glyph sequence sits at lineData[i]
    wordsAt(lineData, i) {
        const hits = [];
        for (const w of this.lexicon) {
            const g = this.glyphsOf(w);
            if (i + g.length > lineData.length) continue;
            let ok = true;
            for (let k = 0; k < g.length; k++) {
                if (lineData[i + k].char !== g[k]) { ok = false; break; }
            }
            if (ok) hits.push({ word: w, len: g.length });
        }
        return hits;
    }

    // ---- main entry: mutate at most once per call, return the array ----
    translateLineData(lineData) {
        for (let i = 0; i < lineData.length; i++) {
            if (Math.random() > this.SCAN_CHANCE) continue;

            const moves = [];
            if (Math.random() < this.P_SEMANTIC)  moves.push('semantic');
            if (Math.random() < this.P_DECOMPOSE) moves.push('decompose');
            if (Math.random() < this.P_COMPOSE)   moves.push('compose');
            moves.sort(() => Math.random() - 0.5);          // try in random order

            for (let m = 0; m < moves.length; m++) {
                if (this[moves[m]](lineData, i)) return lineData;   // first to fire wins
            }
        }
        return lineData;
    }

    // 1. meaning -> another language's word for the same meaning
    semantic(lineData, i) {
        const hits = this.wordsAt(lineData, i);
        if (!hits.length) return false;
        const chosen = this.pick(hits);
        const word = chosen.word, len = chosen.len;
        const here = this.glyphsOf(word).join('');
        const pool = (this.byMeaning[word.meaning] || [])
            .filter(v => this.glyphsOf(v).join('') !== here);
        if (!pool.length) return false;
        const v = this.pick(pool);
        const cls = lineData[i].className;
        const cells = this.glyphsOf(v).map(ch => this.cell(ch, cls));
        lineData.splice(i, len, ...cells);
        return true;
    }

    // 2. a syllable of a word also BEGINS another word -> splice that word in
    decompose(lineData, i) {
        const hits = this.wordsAt(lineData, i);
        if (!hits.length) return false;
        const word = this.pick(hits).word;
        const j = Math.floor(Math.random() * word.syllables.length);
        const p = word.syllables[j].p;
        const pool = (this.byFirstPhon[p] || []).filter(v => v !== word);
        if (!pool.length) return false;
        const v = this.pick(pool);

        let off = 0;                                   // glyph offset of syllable j
        for (let k = 0; k < j; k++) off += word.syllables[k].g.length;
        const sylLen = word.syllables[j].g.length;
        const cls = lineData[i + off].className;
        const cells = this.glyphsOf(v).map(ch => this.cell(ch, cls));
        lineData.splice(i + off, sylLen, ...cells);
        return true;
    }

    // 3. adjacent loose syllables spell a word -> fuse into it
    compose(lineData, i) {
        const phons = [];
        const maxLen = Math.min(this.MAX_COMPOSE, lineData.length - i);
        for (let len = 1; len <= maxLen; len++) {
            const info = GLYPH_DATA[lineData[i + len - 1].char];
            if (!info || !info.phoneme) break;         // run of phonetic cells only
            phons.push(info.phoneme);
            if (len < 2) continue;                     // need at least two to fuse
            const pool = this.byPhonSeq[phons.join('|')];
            if (pool && pool.length) {
                const v = this.pick(pool);
                if (this.glyphsOf(v).join('') === phons.join('')) continue; // no-op guard
                const cls = lineData[i].className;
                const cells = this.glyphsOf(v).map(ch => this.cell(ch, cls));
                lineData.splice(i, len, ...cells);
                return true;
            }
        }
        return false;
    }
}
