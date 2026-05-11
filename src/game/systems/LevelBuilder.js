import { TILE_SIZE, ROWS, TILE_TYPES } from "../constants";
import { ri, rnd, clamp } from "../utils";

export class LevelBuilder {
    static build(sector) {
        const COLS = 52 + sector * 6;
        const t = Array.from({ length: ROWS }, () => new Uint8Array(COLS));

        // Ground
        for (let c = 0; c < COLS; c++) {
            const gap =
                sector > 0 && c > 10 && c < COLS - 6 && (c % 16 === 0 || c % 21 === 0);
            if (!gap) t[ROWS - 1][c] = TILE_TYPES.SOLID;
        }

        // Terrain bumps
        let h = ROWS - 2;
        for (let c = 2; c < COLS - 8; c++) {
            if (Math.random() < 0.06)
                h = clamp(h + (Math.random() < 0.5 ? 1 : -1), ROWS - 6, ROWS - 2);
            for (let r = h; r < ROWS - 1; r++) t[r][c] = TILE_TYPES.SOLID;
        }

        // Platforms
        for (let c = 4; c < COLS - 6; c += 4 + ri(5)) {
            const r = ROWS - 3 - ri(5);
            const w = 2 + ri(4);
            for (let i = 0; i < w && c + i < COLS - 2; i++) {
                t[r][c + i] = TILE_TYPES.SOLID;
                if (Math.random() > 0.5 && t[r - 1][c + i] === 0)
                    t[r - 1][c + i] = TILE_TYPES.COIN;
            }
        }

        // Spikes
        for (let c = 5; c < COLS - 5; c++) {
            if (ri(100) > 30 + sector * 2) continue;
            let r = ROWS - 1;
            while (r > 0 && t[r][c] === TILE_TYPES.SOLID) r--;

            if (Math.random() < 0.7) {
                while (r > 1 && t[r][c] === TILE_TYPES.EMPTY) r--;
                r--;
            }

            t[r][c] = TILE_TYPES.SPIKE;
        }

        // Enemies: 3=walker 8=shooter
        for (let c = 5; c < COLS - 4; c += 4 + ri(2)) {
            let r = ROWS - 1;
            while (r > 0 && t[r][c] === TILE_TYPES.SOLID) r--;

            if (Math.random() < 0.7) {
                while (r > 0 && t[r][c] === TILE_TYPES.EMPTY) r--;
            }
            if (r == 0) continue;

            t[r - 1][c] =
                sector > 1 && Math.random() < 0.4
                    ? TILE_TYPES.SHOOTER
                    : TILE_TYPES.WALKER;
        }

        // Exit column
        for (let r = ROWS - 5; r < ROWS - 1; r++) t[r][COLS - 3] = TILE_TYPES.SOLID;
        t[ROWS - 5][COLS - 3] = TILE_TYPES.EXIT;

        return { t, ROWS, COLS };
    }

    static parseTiles(lv, sector) {
        const { t, ROWS, COLS } = lv;
        const enemies = [];
        const coins = [];

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const tile = t[r][c];
                const wx = c * TILE_SIZE;
                const wy = r * TILE_SIZE;

                if (tile === TILE_TYPES.WALKER) {
                    enemies.push({
                        x: wx,
                        y: wy,
                        w: 22,
                        h: 26,
                        vx: (Math.random() > 0.5 ? 1 : -1) * (1.3 + sector * 0.25),
                        vy: 0,
                        hp: 1,
                        maxHp: 1,
                        onG: false,
                        dead: false,
                        type: "walker",
                        animT: 0,
                    });
                }

                if (tile === TILE_TYPES.SHOOTER) {
                    if (Math.random() < 0.4) {
                        enemies.push({
                            x: wx,
                            y: wy - TILE_SIZE * 3,
                            w: 22,
                            h: 22,
                            vx: (Math.random() > 0.5 ? 1.2 : -1.2) * (1 + sector * 0.2),
                            vy: 0,
                            hp: 2,
                            maxHp: 2,
                            onG: false,
                            dead: false,
                            type: "flyer",
                            animT: 0,
                            baseY: wy - TILE_SIZE * 3,
                        });
                    } else {
                        enemies.push({
                            x: wx,
                            y: wy,
                            w: 24,
                            h: 24,
                            vx: Math.random() > 0.5 ? 0.6 : -0.6,
                            vy: 0,
                            hp: 3,
                            maxHp: 3,
                            onG: false,
                            dead: false,
                            type: "shooter",
                            animT: 0,
                            scd: 60 + ri(60),
                        });
                    }
                }

                if (tile === TILE_TYPES.COIN) {
                    coins.push({
                        x: wx + TILE_SIZE / 2,
                        y: wy + TILE_SIZE * 0.35,
                        r: 7,
                        taken: false,
                        bt: rnd(Math.PI * 2),
                    });
                }
            }
        }

        return { enemies, coins };
    }
}
