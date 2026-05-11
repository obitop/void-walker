import {
  TILE_SIZE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  //  INVINCIBILITY_FRAMES,
  TOTAL_SECTORS,
  COYOTE_TIME,
  DOUBLE_JUMP_COUNT,
  JUMP_BUFFER_TIME,
} from "../game/constants";
import { LevelBuilder } from "../game/systems/LevelBuilder";
import { Physics } from "../game/systems/Physics";
import { Renderer } from "../game/systems/Renderer";
import { rnd, ri, lerp, clamp, spike, overlap, solid } from "../game/utils";

export class GameEngine {
  constructor(canvasElement, width, height) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;

    this.state = null;
    this.animId = null;
    this.input = {
      left: false,
      right: false,
      up: false,
      shoot: false,
    };
    this.jumpBuffer = 0;
    this.jumpHeld = false;

    this.setupInput();
    this.setupStars();
  }

  setupInput() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") this.input.left = true;
      if (e.key === "ArrowRight" || e.key === "d") this.input.right = true;
      if (
        (e.key === "ArrowUp" || e.key === "w" || e.key === " ") &&
        !this.jumpHeld
      ) {
        this.input.up = true;
        this.jumpHeld = true;
        this.jumpBuffer = JUMP_BUFFER_TIME;
        e.preventDefault();
      }
      if (e.key === "z" || e.key === "x" || e.key === "ArrowDown")
        this.input.shoot = true;
    });

    document.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") this.input.left = false;
      if (e.key === "ArrowRight" || e.key === "d") this.input.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
        this.input.up = false;
        this.jumpHeld = false;
      }
      if (e.key === "z" || e.key === "x" || e.key === "ArrowDown")
        this.input.shoot = false;
    });
  }

  setupStars() {
    this.stars = [];
    for (let i = 0; i < 220; i++) {
      this.stars.push({
        x: rnd(this.width * 3),
        y: rnd(this.height),
        r: rnd(1.6) + 0.2,
        tw: rnd(Math.PI * 2),
        speed: rnd(0.4) + 0.05,
        layer: ri(3),
        col: ["#cce8ff", "#aad4ff", "#ddeeff"][ri(3)],
      });
    }
  }

  setupNebulae() {
    this.nebulae = [];
    const cols = ["#080030", "#00080a", "#180008", "#000820", "#0a0018"];
    const levelW = this.state.lv.COLS * TILE_SIZE;
    for (let i = 0; i < 12; i++) {
      this.nebulae.push({
        x: rnd(levelW),
        y: rnd(this.height * 0.85),
        r: 80 + rnd(200),
        col: cols[ri(cols.length)],
        alpha: rnd(0.14) + 0.04,
      });
    }
  }

  setupPlanet() {
    const cols = [
      { b: "#1a0044", s: "#2a0066", atm: "#6600aa" },
      { b: "#003300", s: "#004400", atm: "#00aa44" },
      { b: "#002244", s: "#003366", atm: "#0066cc" },
      { b: "#330000", s: "#440000", atm: "#aa0022" },
    ];
    const c = cols[ri(cols.length)];
    const levelW = this.state.lv.COLS * TILE_SIZE;
    this.planet = {
      x: levelW * 0.3 + rnd(levelW * 0.3),
      y: this.height * 0.12 + rnd(this.height * 0.12),
      r: 70 + rnd(60),
      ...c,
      rings: Math.random() > 0.5,
    };
  }

  start() {
    this.state = {
      running: true,
      sector: 1,
      score: 0,
      deaths: 0,
      totalCoins: 0,
      gameTime: 0,
      cam: { x: 0, y: 0 },
      player: {
        x: 2 * TILE_SIZE,
        y: 100,
        vx: 0,
        vy: 0,
        w: PLAYER_WIDTH,
        h: PLAYER_HEIGHT,
        hp: 5,
        maxHp: 5,
        energy: 100,
        onG: false,
        coyote: 0,
        jumpsLeft: DOUBLE_JUMP_COUNT,
        invincible: 0,
        shootCd: 0,
        dead: false,
        facingR: true,
        animT: 0,
      },
      lv: null,
      enemies: [],
      bullets: [],
      eBullets: [],
      coins: [],
      particles: [],
      popups: [],
      exitDone: false,
    };

    this.loadSector();
  }

  loadSector() {
    const lv = LevelBuilder.build(this.state.sector - 1);
    this.state.lv = lv;

    const parsed = LevelBuilder.parseTiles(lv, this.state.sector - 1);
    this.state.enemies = parsed.enemies;
    this.state.coins = parsed.coins;
    this.state.bullets = [];
    this.state.eBullets = [];
    this.state.particles = [];
    this.state.popups = [];
    this.state.exitDone = false;

    this.setupNebulae();
    this.setupPlanet();

    const p = this.state.player;
    p.x = 2 * TILE_SIZE;
    p.y = (lv.ROWS - 4) * TILE_SIZE;
    p.vx = 0;
    p.vy = 0;
    p.dead = false;
    p.invincible = 0;
    p.onG = false;
    p.jumpsLeft = DOUBLE_JUMP_COUNT;
    this.state.cam.x = 0;
    this.state.cam.y = 0;

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animId = requestAnimationFrame(() => this.gameLoop());
  }

  gameLoop() {
    if (!this.state || !this.state.running) return;
    this.animId = requestAnimationFrame(() => this.gameLoop());

    this.state.gameTime++;
    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
    this.updateCoins();
    this.updateParticles();

    this.render();
  }

  updatePlayer() {
    const p = this.state.player;
    if (p.dead) return;

    const spd = 8 + this.state.sector * 0.1;
    if (this.input.left) {
      p.vx = lerp(p.vx, -spd, 0.28);
      p.facingR = false;
    } else if (this.input.right) {
      p.vx = lerp(p.vx, spd, 0.28);
      p.facingR = true;
    } else {
      p.vx = lerp(p.vx, 0, 0.22);
    }

    if (p.onG) {
      p.coyote = COYOTE_TIME;
      p.jumpsLeft = DOUBLE_JUMP_COUNT;
    } else if (p.coyote > 0) {
      p.coyote--;
    }
    if (this.jumpBuffer > 0) this.jumpBuffer--;

    if (this.jumpBuffer > 0 && (p.coyote > 0 || p.jumpsLeft > 0)) {
      if (p.onG || p.coyote > 0) {
        p.vy = -13 - this.state.sector * 0.1;
        p.jumpsLeft = 1;
      } else if (p.jumpsLeft > 0) {
        p.vy = -11;
        p.jumpsLeft--;
        this.burst(p.x + p.w / 2, p.y + p.h, "#0088ff", 8, 3);
      }
      this.jumpBuffer = 0;
      p.coyote = 0;
    }

    if (!this.input.up && p.vy < -4) p.vy = Math.max(p.vy, -4);

    if (p.shootCd > 0) p.shootCd--;
    p.energy = Math.min(100, p.energy + 0.2);
    if (this.input.shoot && p.shootCd <= 0 && p.energy >= 12) {
      const dir = p.facingR ? 1 : -1;
      this.state.bullets.push({
        x: p.x + (p.facingR ? p.w : 0),
        y: p.y + p.h * 0.35,
        vx: dir * 13,
        vy: 0,
        w: 14,
        h: 5,
        life: 38,
      });
      p.energy -= 12;
      p.shootCd = 14;
      this.burst(
        p.x + (p.facingR ? p.w + 2 : -4),
        p.y + p.h * 0.35,
        "#00ffff",
        4,
        2,
      );
    }

    if (this.input.left || this.input.right) p.animT++;

    Physics.moveEntity(p, this.state.lv);

    const tx = p.x - this.width * 0.38 + p.vx * 10;
    const maxCamX = Math.max(0, this.state.lv.COLS * TILE_SIZE - this.width);
    const maxCamY = Math.max(0, this.state.lv.ROWS * TILE_SIZE - this.height);
    this.state.cam.x = lerp(this.state.cam.x, clamp(tx, 0, maxCamX), 0.12);
    const ty = p.y - this.height * 0.5;
    this.state.cam.y = lerp(this.state.cam.y, clamp(ty, 0, maxCamY), 0.1);

    // Check spike
    const pc0 = Math.floor(p.x / TILE_SIZE);
    const pc1 = Math.floor((p.x + p.w - 1) / TILE_SIZE);
    const pr0 = Math.floor(p.y / TILE_SIZE);
    const pr1 = Math.floor((p.y + p.h - 1) / TILE_SIZE);
    let onSpike = false;
    for (let c = pc0; c <= pc1; c++) {
      for (let r = pr0; r <= pr1; r++) {
        if (
          spike(this.state.lv.t, this.state.lv.ROWS, this.state.lv.COLS, c, r)
        ) {
          onSpike = true;
        }
      }
    }
    if (onSpike || p.y > this.state.lv.ROWS * TILE_SIZE + 60) this.playerDie();

    // Check exit
    const exitC = this.state.lv.COLS - 3;
    const exitR = this.state.lv.ROWS - 5;
    if (
      !this.state.exitDone &&
      p.x + p.w > exitC * TILE_SIZE &&
      p.y < (exitR + 4) * TILE_SIZE &&
      p.y + p.h > exitR * TILE_SIZE
    ) {
      this.state.exitDone = true;
      this.state.score += 1000 * this.state.sector;
      this.burst(
        exitC * TILE_SIZE + TILE_SIZE / 2,
        exitR * TILE_SIZE,
        "#00ffcc",
        25,
        6,
      );
      setTimeout(() => {
        if (this.state.sector >= TOTAL_SECTORS) {
          this.endGame(true);
        } else {
          this.state.sector++;
          this.loadSector();
        }
      }, 1300);
    }
  }

  updateEnemies() {
    const p = this.state.player;
    this.state.enemies.forEach((e) => {
      if (e.dead) return;
      e.animT++;

      // Check for walker collision with blocks before moving
      if (e.type === "walker") {
        const { t, ROWS, COLS } = this.state.lv;

        // Check if next move would hit a block
        let wouldHitBlock = false;
        const nextX = e.x + e.vx;
        const r0 = Math.floor(e.y / TILE_SIZE);
        const r1 = Math.floor((e.y + e.h - 1) / TILE_SIZE);

        if (e.vx > 0) {
          const c = Math.floor((nextX + e.w) / TILE_SIZE);
          for (let r = r0; r <= r1; r++) {
            if (solid(t, ROWS, COLS, c, r)) {
              wouldHitBlock = true;
              break;
            }
          }
        } else if (e.vx < 0) {
          const c = Math.floor(nextX / TILE_SIZE);
          for (let r = r0; r <= r1; r++) {
            if (solid(t, ROWS, COLS, c, r)) {
              wouldHitBlock = true;
              break;
            }
          }
        }

        // Check if would go out of bounds
        const maxX = COLS * TILE_SIZE - e.w;
        const wouldHitEdge = nextX < 0 || nextX > maxX;

        // Check if walker would step off an edge into air
        const belowRow = Math.floor((e.y + e.h) / TILE_SIZE);
        const frontCol =
          e.vx > 0
            ? Math.floor((nextX + e.w - 1) / TILE_SIZE)
            : Math.floor(nextX / TILE_SIZE);
        const wouldStepOff =
          e.vx !== 0 &&
          belowRow < ROWS &&
          !solid(t, ROWS, COLS, frontCol, belowRow);

        if (wouldHitBlock || wouldHitEdge || wouldStepOff) {
          e.vx *= -1;
        }
      }

      Physics.moveEntity(e, this.state.lv);

      if (e.y > this.state.lv.ROWS * TILE_SIZE + 60) {
        e.dead = true;
        return;
      }

      if (e.type === "flyer") {
        e.y = (e.baseY || 200) + Math.sin(e.animT * 0.04) * 40;
        e.x += e.vx;
        if (e.x < 0 || e.x + e.w > this.state.lv.COLS * TILE_SIZE) e.vx *= -1;
        if (!p.dead) {
          const fdx = p.x - e.x;
          if (Math.abs(fdx) < 200) e.vx = lerp(e.vx, Math.sign(fdx) * 3, 0.05);
        }
        return;
      }

      if (e.type === "shooter") {
        if (e.scd > 0) e.scd--;
        else {
          const dx = p.x - e.x;
          const dy = p.y - e.y;
          const dd = Math.hypot(dx, dy) || 1;
          if (dd < 380) {
            const spd2 = 4 + this.state.sector * 0.35;
            this.state.eBullets.push({
              x: e.x + e.w / 2,
              y: e.y + e.h / 2,
              vx: (dx / dd) * spd2,
              vy: (dy / dd) * spd2,
              w: 9,
              h: 9,
              life: 75,
            });
            e.scd = 55 + ri(40);
          }
        }
      }

      if (!p.dead && p.invincible <= 0 && overlap(p, e)) {
        if (p.vy > 0 && p.y + p.h < e.y + e.h * 0.6) {
          e.hp--;
          this.burst(e.x + e.w / 2, e.y, "#ff4400", 12, 5);
          const pts = 200 * this.state.sector;
          this.state.score += pts;
          this.addPopup(e.x + e.w / 2, e.y - 10, "+" + pts, "#ff8800");
          p.vy = -10;
          if (e.hp <= 0) {
            e.dead = true;
            this.state.score += 100;
            this.burst(e.x + e.w / 2, e.y + e.h / 2, "#ff2200", 16, 6);
          }
        } else {
          this.playerDie();
        }
      }
    });
  }

  updateBullets() {
    const p = this.state.player;
    this.state.bullets.forEach((b) => {
      b.x += b.vx;
      b.life--;
      if (b.life <= 0) return;

      this.state.enemies.forEach((e) => {
        if (e.dead || b.life <= 0) return;
        if (overlap(b, e)) {
          b.life = 0;
          e.hp--;
          this.burst(e.x + e.w / 2, e.y + e.h / 2, "#ff6600", 7, 4);
          const pts = 50;
          this.state.score += pts;
          this.addPopup(e.x + e.w / 2, e.y - 5, "+" + pts, "#ff8800");
          if (e.hp <= 0) {
            e.dead = true;
            this.state.score += 150;
            this.burst(e.x + e.w / 2, e.y + e.h / 2, "#ff2200", 18, 6);
            this.addPopup(e.x + e.w / 2, e.y - 20, "+150 KILL!", "#ff4400");
          }
        }
      });
    });
    this.state.bullets = this.state.bullets.filter((b) => b.life > 0);

    this.state.eBullets.forEach((b) => {
      b.x += b.vx;
      b.y += b.vy;
      b.life--;
      if (!p.dead && p.invincible <= 0 && overlap(b, p)) {
        b.life = 0;
        this.playerDie();
      }
    });
    this.state.eBullets = this.state.eBullets.filter((b) => b.life > 0);
  }

  updateCoins() {
    const p = this.state.player;
    this.state.coins.forEach((c) => {
      if (c.taken) return;
      const dx = p.x + p.w / 2 - c.x;
      const dy = p.y + p.h / 2 - c.y;
      if (Math.hypot(dx, dy) < c.r + p.w / 2) {
        c.taken = true;
        this.state.score += 50;
        this.state.totalCoins++;
        p.energy = Math.min(100, p.energy + 8);
        this.burst(c.x, c.y, "#00ffcc", 7, 3);
        this.addPopup(c.x, c.y - 14, "+50", "#00ffcc");
      }
    });
  }

  updateParticles() {
    this.state.particles.forEach((pt) => {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.09;
      pt.life -= 0.026;
      pt.vx *= 0.94;
    });
    this.state.particles = this.state.particles.filter((pt) => pt.life > 0);
  }

  burst(x, y, col, n = 10, spd = 4) {
    for (let i = 0; i < n; i++) {
      const a = rnd(Math.PI * 2);
      const s = rnd(spd) + 1;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 1,
        col,
        r: rnd(3) + 1.5,
      });
    }
  }

  addPopup(x, y, text, col) {
    this.state.popups.push({
      x,
      y,
      text,
      col,
      life: 1,
    });
  }

  playerDie() {
    const p = this.state.player;
    if (p.dead || p.invincible > 40) return;
    p.dead = true;
    p.hp = Math.max(0, p.hp - 1);
    this.burst(p.x + p.w / 2, p.y + p.h / 2, "#ff2200", 18, 5);
    setTimeout(() => {
      if (p.hp <= 0) {
        this.endGame(false);
      } else {
        this.state.deaths++;
        p.x = 2 * TILE_SIZE;
        p.y = (this.state.lv.ROWS - 4) * TILE_SIZE;
        p.vx = 0;
        p.vy = 0;
        p.dead = false;
        p.invincible = 0;
        p.jumpsLeft = DOUBLE_JUMP_COUNT;
        p.onG = false;
        this.state.cam.x = 0;
      }
    }, 900);
  }

  endGame(win) {
    console.log("Ending game with : ", win);
    this.state.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    return {
      won: win,
      score: this.state.score,
      sector: this.state.sector,
      totalCoins: this.state.totalCoins,
      deaths: this.state.deaths,
    };
  }

  render() {
    Renderer.drawBackground(
      this.ctx,
      this.width,
      this.height,
      this.nebulae,
      this.stars,
      this.planet,
      this.state.gameTime,
      this.state.cam,
    );
    Renderer.drawTiles(
      this.ctx,
      this.state.lv,
      this.state.cam,
      this.width,
      this.height,
      this.state.gameTime,
    );
    this.state.coins.forEach((c) =>
      Renderer.drawCoin(this.ctx, c, this.state.cam),
    );
    this.state.eBullets.forEach((b) =>
      Renderer.drawBullet(this.ctx, b, this.state.cam, "#cc00ff"),
    );
    this.state.bullets.forEach((b) =>
      Renderer.drawBullet(this.ctx, b, this.state.cam, "#00ffff"),
    );
    this.state.enemies.forEach((e) =>
      Renderer.drawEnemy(this.ctx, e, this.state.cam, this.state.gameTime),
    );
    if (!this.state.player.dead)
      Renderer.drawPlayer(
        this.ctx,
        this.state.player,
        this.state.cam,
        this.state.gameTime,
      );

    this.state.particles.forEach((pt) => {
      this.ctx.globalAlpha = pt.life;
      this.ctx.fillStyle = pt.col;
      this.ctx.beginPath();
      this.ctx.arc(
        pt.x - this.state.cam.x,
        pt.y - this.state.cam.y,
        pt.r,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1;

    // Progress bar
    const prog = clamp(
      this.state.player.x / (this.state.lv.COLS * TILE_SIZE),
      0,
      1,
    );
    this.ctx.fillStyle = "rgba(0,0,20,0.7)";
    this.ctx.fillRect(0, this.height - 4, this.width, 4);
    this.ctx.fillStyle = "#0088cc";
    this.ctx.fillRect(0, this.height - 4, this.width * prog, 4);

    // Scanlines
    this.ctx.fillStyle = "rgba(0,140,255,0.025)";
    this.ctx.fillRect(
      0,
      (this.state.gameTime * 2) % this.height,
      this.width,
      2,
    );
  }

  dispose() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.state = null;
  }

  resize(newWidth, newHeight) {
    if (!this.canvas || !this.state) return;

    this.width = newWidth;
    this.height = newHeight;
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;

    // Update camera bounds based on new dimensions
    this.state.cam.x = Math.max(
      0,
      Math.min(this.state.cam.x, this.state.lv.COLS * TILE_SIZE - newWidth),
    );
    this.state.cam.y = Math.max(
      0,
      Math.min(this.state.cam.y, this.state.lv.ROWS * TILE_SIZE - newHeight),
    );
  }
}
