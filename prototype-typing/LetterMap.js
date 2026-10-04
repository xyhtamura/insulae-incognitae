// letterMap.js

// watery
// (unchanged from spirit of your last request)
const WATERY = {
  water:     { glyphs:['~','川'] },
  coldwater: { glyphs:['﹌','〰'] },
  reef:      { glyphs:['珊','⋰'] },      // "珊" evokes coral
  estuary:   { glyphs:['入','河'] },      // river-mouth vibe
  swamp:     { glyphs:['≈','沼'] },
  ice:       { glyphs:['❄','冰'] }       // iceberg/pack ice
};

// six land “Köppen-ish” families
const LAND6 = {
  tropical_rainforest: { glyphs:['林','森'] },
  tropical_savanna:    { glyphs:['草','艹'] },
  steppe:              { glyphs:['‒','═'] },
  temperate_forest:    { glyphs:['木','朴'] },
  boreal_taiga:        { glyphs:['杉','針'] }, // “needle/cedar” feel
  tundra:              { glyphs:['苔','·'] }   // moss/dot sparse
};

// optional classic land biomes you liked earlier (still usable)
const CLASSIC = {
  sand:     { glyphs:['.','砂'] },
  desert:   { glyphs:['⋱','𐤃'] },
  mountain: { glyphs:['△','山'] },
  rock:     { glyphs:['⛰','岩'] },
  plain:    { glyphs:['⎽','⎼'] },
  forest:   { glyphs:['木','林'] }
};

// map 26 letters → biomes (watery + 6-land families; tweak as you wish)
const LETTER_TO_BIOME = {
  // watery group
  e:{biome:'water',     glyphs:WATERY.water.glyphs},
  t:{biome:'water',     glyphs:WATERY.water.glyphs},
  j:{biome:'coldwater', glyphs:WATERY.coldwater.glyphs},
  p:{biome:'coldwater', glyphs:WATERY.coldwater.glyphs},
  u:{biome:'reef',      glyphs:WATERY.reef.glyphs},
  f:{biome:'reef',      glyphs:WATERY.reef.glyphs},
  i:{biome:'estuary',   glyphs:WATERY.estuary.glyphs},
  y:{biome:'estuary',   glyphs:WATERY.estuary.glyphs},
  o:{biome:'swamp',     glyphs:WATERY.swamp.glyphs},
  v:{biome:'ice',       glyphs:WATERY.ice.glyphs},

  // six land families (repeaters)
  r:{biome:'tropical_rainforest', glyphs:LAND6.tropical_rainforest.glyphs},
  q:{biome:'tropical_rainforest', glyphs:LAND6.tropical_rainforest.glyphs},

  s:{biome:'tropical_savanna', glyphs:LAND6.tropical_savanna.glyphs},
  b:{biome:'tropical_savanna', glyphs:LAND6.tropical_savanna.glyphs},

  c:{biome:'steppe', glyphs:LAND6.steppe.glyphs},
  g:{biome:'steppe', glyphs:LAND6.steppe.glyphs},

  l:{biome:'temperate_forest', glyphs:LAND6.temperate_forest.glyphs},
  w:{biome:'temperate_forest', glyphs:LAND6.temperate_forest.glyphs},

  n:{biome:'boreal_taiga', glyphs:LAND6.boreal_taiga.glyphs},
  k:{biome:'boreal_taiga', glyphs:LAND6.boreal_taiga.glyphs},

  z:{biome:'tundra', glyphs:LAND6.tundra.glyphs},
  m:{biome:'tundra', glyphs:LAND6.tundra.glyphs},

  // a/d/x/h still mapped to “classic” land tiles if you want them in play
  a:{biome:'sand',     glyphs:CLASSIC.sand.glyphs},
  d:{biome:'sand',     glyphs:CLASSIC.sand.glyphs},
  x:{biome:'mountain', glyphs:CLASSIC.mountain.glyphs},
  h:{biome:'plain',    glyphs:CLASSIC.plain.glyphs}
};

// rendering policy
const WATERY_BIOMES = new Set([
  'water','coldwater','reef','estuary','swamp','ice'
]);
const LAND_BIOMES = new Set([
  'tropical_rainforest','tropical_savanna','steppe',
  'temperate_forest','boreal_taiga','tundra',
  'sand','desert','mountain','rock','plain','forest'
]);
