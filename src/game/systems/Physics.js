import {
    GRAVITY,
    MAX_FALL_SPEED,
    MAX_RISE_SPEED,
    TILE_SIZE,
} from "../constants";
import { clamp, solid } from "../utils";

export class Physics {
  static moveEntity(e, lv, grav = GRAVITY) {
    e.vy += grav;
    e.vy = clamp(e.vy, -MAX_RISE_SPEED, MAX_FALL_SPEED);

    const { t, ROWS, COLS } = lv;

    // Horizontal movement
    e.x += e.vx;
    const r0 = Math.floor(e.y / TILE_SIZE);
    const r1 = Math.floor((e.y + e.h - 1) / TILE_SIZE);

    if (e.vx > 0) {
      const c = Math.floor((e.x + e.w) / TILE_SIZE);
      for (let r = r0; r <= r1; r++) {
        if (solid(t, ROWS, COLS, c, r)) {
          e.x = c * TILE_SIZE - e.w;
          break;
        }
      }
    } else if (e.vx < 0) {
      const c = Math.floor(e.x / TILE_SIZE);
      for (let r = r0; r <= r1; r++) {
        if (solid(t, ROWS, COLS, c, r)) {
          e.x = (c + 1) * TILE_SIZE;
          e.vx = 0;
          break;
        }
      }
    }

    // Vertical movement
    e.y += e.vy;
    const c0 = Math.floor(e.x / TILE_SIZE);
    const c1 = Math.floor((e.x + e.w - 1) / TILE_SIZE);
    // const wasOnG = e.onG;
    e.onG = false;

    if (e.vy >= 0) {
      const r = Math.floor((e.y + e.h) / TILE_SIZE);
      for (let c = c0; c <= c1; c++) {
        if (solid(t, ROWS, COLS, c, r)) {
          e.y = r * TILE_SIZE - e.h;
          e.vy = 0;
          e.onG = true;
          break;
        }
      }
    } else {
      const r = Math.floor(e.y / TILE_SIZE);
      for (let c = c0; c <= c1; c++) {
        if (solid(t, ROWS, COLS, c, r)) {
          e.y = (r + 1) * TILE_SIZE;
          e.vy = 0;
          break;
        }
      }
    }

    // Boundaries
    const maxX = COLS * TILE_SIZE - e.w;
    if (e.x < 0) {
      e.x = 0;
      e.vx = Math.abs(e.vx);
    }
    if (e.x > maxX) {
      e.x = maxX;
      e.vx = -Math.abs(e.vx);
    }
  }
}
