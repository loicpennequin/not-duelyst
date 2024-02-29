export type RotationAngleDeg = 0 | 90 | 180 | 270;

export function rotate90<T>(a: T[][]): T[][] {
  const w = a.length;
  const h = a[0].length;
  const b = new Array(h);
  for (let y = 0; y < h; y++) {
    b[y] = new Array(w);
    for (let x = 0; x < w; x++) {
      b[y][x] = a[w - 1 - x][y];
    }
  }
  return b;
}

export function rotate180<T>(a: T[][]): T[][] {
  const w = a[0].length;
  const h = a.length;
  const b = new Array(h);
  for (let y = 0; y < h; y++) {
    const n = h - 1 - y;
    b[n] = new Array(w);
    for (let x = 0; x < w; x++) {
      b[n][w - 1 - x] = a[y][x];
    }
  }
  return b;
}

export function rotate270<T>(a: T[][]): T[][] {
  const w = a.length;
  const h = a[0].length;
  const b = new Array(h);
  for (let y = 0; y < h; y++) {
    b[y] = new Array(w);
    for (let x = 0; x < w; x++) {
      b[y][x] = a[x][h - 1 - y];
    }
  }
  return b;
}

export function rotate<T>(a: T[][], deg: RotationAngleDeg): T[][] {
  if (deg % 90 !== 0) {
    throw new Error('Invalid input; degrees must be a multiple of 90');
  }
  const d = ((deg % 360) + 360) % 360;
  if (d === 90) {
    return rotate90(a);
  } else if (d === 180) {
    return rotate180(a);
  } else if (d === 270) {
    return rotate270(a);
  }
  // otherwise, if it's 0 degrees
  return a;
}
