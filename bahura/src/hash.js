// Seeded integer hash and value noise. No DOM, so Node can run the board checks.

// A full avalanche mix of three integers, returned in [0, 1).
export function unit(a, b, salt) {
  let h = (Math.imul(a | 0, 0x9E3779B1) ^ Math.imul(b | 0, 0x85EBCA6B) ^ Math.imul(salt | 0, 0xC2B2AE35)) >>> 0;
  h ^= h >>> 16; h = Math.imul(h, 0x85EBCA6B);
  h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// Smooth value noise over the plane, so neighbouring keys share a value.
export function noise(x, y, salt) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const tx = x - xi, ty = y - yi;
  const ux = tx * tx * (3 - 2 * tx), uy = ty * ty * (3 - 2 * ty);
  const top = unit(xi, yi, salt) * (1 - ux) + unit(xi + 1, yi, salt) * ux;
  const bottom = unit(xi, yi + 1, salt) * (1 - ux) + unit(xi + 1, yi + 1, salt) * ux;
  return top * (1 - uy) + bottom * uy;
}
