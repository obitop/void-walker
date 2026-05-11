// Utility functions
export const rnd = (n) => Math.random() * n;
export const ri = (n) => Math.floor(Math.random() * n);
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const overlap = (a, b) => {
  return (
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
  );
};

export const getTile = (t, ROWS, COLS, c, r) => {
  if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return 0;
  return t[r][c];
};

export const solid = (t, ROWS, COLS, c, r) => {
  const v = getTile(t, ROWS, COLS, c, r);
  return v === 1 || v === 6;
};

export const spike = (t, ROWS, COLS, c, r) => {
  return getTile(t, ROWS, COLS, c, r) === 2;
};
