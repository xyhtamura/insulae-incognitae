// How the board is drawn, apart from each habitat's own colours
// (data/habitats.js).

// Strength of every colour on the board: 1 is the habitat colours as written,
// 0 is grey. The Audition panel's Colour slider moves it.
export const SATURATION = { min: 0.2, max: 1, step: 0.05, initial: 0.65 };

// Photographed textures, by habitat id. A habitat listed here has its image
// tiled over its colour and multiplied into it; one not listed is drawn with
// colour, shading, and generated grain only. `size` is how much of the board
// one tile covers, in key spacings.
//
//   coral: { src: 'textures/coral.jpg', size: 1.5 },
//
// Record each file's source and licence in ../ASSETS.md before it is committed.
export const TEXTURES = {};
