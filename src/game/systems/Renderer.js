import { TILE_SIZE } from "../constants";
import { clamp, rnd } from "../utils";

export class Renderer {
  static drawBackground(ctx, W, H, nebulae, stars, planet, gameTime, camera) {
    // Deep space gradient
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#000008");
    bg.addColorStop(0.5, "#000015");
    bg.addColorStop(1, "#00001e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Nebulae
    nebulae.forEach((nb) => {
      const px = nb.x - camera.x * 0.06;
      const py = nb.y;
      if (px + nb.r < 0 || px - nb.r > W) return;
      ctx.globalAlpha = nb.alpha;
      const grd = ctx.createRadialGradient(px, py, 0, px, py, nb.r);
      grd.addColorStop(0, nb.col);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(px, py, nb.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Stars
    const pxLayers = [0.04, 0.1, 0.18];
    stars.forEach((s) => {
      s.tw += 0.025;
      const px =
        (((s.x - camera.x * pxLayers[s.layer]) % (W * 3)) + W * 3) % (W * 3);
      if (px > W + 4) return;
      ctx.globalAlpha = clamp(0.3 + Math.sin(s.tw) * 0.35, 0.05, 1);
      ctx.fillStyle = s.col;
      ctx.beginPath();
      ctx.arc(px, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Planet
    if (planet) {
      const px = planet.x - camera.x * 0.08;
      const py = planet.y;
      if (px > -planet.r - 20 && px < W + planet.r + 20) {
        // Shadow
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(px + 18, py + 18, planet.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Body gradient
        const grd = ctx.createRadialGradient(
          px - planet.r * 0.3,
          py - planet.r * 0.3,
          planet.r * 0.1,
          px,
          py,
          planet.r,
        );
        grd.addColorStop(0, planet.s);
        grd.addColorStop(0.7, planet.b);
        grd.addColorStop(1, "#000");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(px, py, planet.r, 0, Math.PI * 2);
        ctx.fill();

        // Atmosphere
        const atm = ctx.createRadialGradient(
          px,
          py,
          planet.r - 4,
          px,
          py,
          planet.r + 12,
        );
        atm.addColorStop(0, "transparent");
        atm.addColorStop(1, planet.atm + "44");
        ctx.fillStyle = atm;
        ctx.beginPath();
        ctx.arc(px, py, planet.r + 12, 0, Math.PI * 2);
        ctx.fill();

        // Rings
        if (planet.rings) {
          ctx.save();
          ctx.translate(px, py);
          ctx.scale(1, 0.22);
          ctx.strokeStyle = planet.atm + "55";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.arc(0, 0, planet.r * 1.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.strokeStyle = planet.atm + "33";
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 0, planet.r * 1.9, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Craters
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#000";
        const craters = [
          [-0.3, -0.2, 0.12],
          [0.2, 0.3, 0.08],
          [-0.1, 0.35, 0.06],
          [0.35, -0.1, 0.09],
        ];
        craters.forEach(([dx, dy, dr]) => {
          ctx.beginPath();
          ctx.arc(
            px + dx * planet.r,
            py + dy * planet.r,
            dr * planet.r,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }
    }

    // Shooting stars
    if (Math.random() < 0.003) {
      const sx = rnd(W);
      const sy = rnd(H * 0.4);
      ctx.strokeStyle = "rgba(200,230,255,0.7)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 60, sy + 20);
      ctx.stroke();
    }
  }

  static drawTiles(ctx, lv, camera, W, H, gameTime) {
    const { t, ROWS, COLS } = lv;
    const c0 = Math.max(0, Math.floor(camera.x / TILE_SIZE) - 1);
    const c1 = Math.min(COLS, c0 + Math.ceil(W / TILE_SIZE) + 2);
    const r0 = Math.max(0, Math.floor(camera.y / TILE_SIZE) - 1);
    const r1 = Math.min(ROWS, r0 + Math.ceil(H / TILE_SIZE) + 2);

    for (let r = r0; r < r1; r++) {
      for (let c = c0; c < c1; c++) {
        const tile = t[r][c];
        if (!tile || tile === 3 || tile === 4) continue;
        const sx = c * TILE_SIZE - camera.x;
        const sy = r * TILE_SIZE - camera.y;

        if (tile === 1) {
          // Metal platform
          ctx.fillStyle = "#070d18";
          ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
          ctx.fillStyle = "#0c1825";
          ctx.fillRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2);

          // Grid detail
          ctx.strokeStyle = "rgba(0,80,160,0.3)";
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx + TILE_SIZE / 2, sy);
          ctx.lineTo(sx + TILE_SIZE / 2, sy + TILE_SIZE);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(sx, sy + TILE_SIZE / 2);
          ctx.lineTo(sx + TILE_SIZE, sy + TILE_SIZE / 2);
          ctx.stroke();

          // Top glow
          ctx.fillStyle = "#0088cc";
          ctx.fillRect(sx, sy, TILE_SIZE, 2);
          ctx.fillStyle = "rgba(0,120,200,0.2)";
          ctx.fillRect(sx, sy + 2, TILE_SIZE, 3);

          // Bolts
          ctx.fillStyle = "#1a3a5a";
          [
            [2, 2],
            [TILE_SIZE - 5, 2],
            [2, TILE_SIZE - 5],
            [TILE_SIZE - 5, TILE_SIZE - 5],
          ].forEach(([bx, by]) => {
            ctx.fillRect(sx + bx, sy + by, 3, 3);
          });
        } else if (tile === 2) {
          // Spike
          const n = 3;
          for (let i = 0; i < n; i++) {
            const spx = sx + i * (TILE_SIZE / n) + TILE_SIZE / (n * 2);
            ctx.fillStyle = "#1a0022";
            ctx.beginPath();
            ctx.moveTo(spx, sy + TILE_SIZE);
            ctx.lineTo(spx - 6, sy + TILE_SIZE - 5);
            ctx.lineTo(spx, sy + 3);
            ctx.lineTo(spx + 6, sy + TILE_SIZE - 5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#cc00ff";
            ctx.shadowColor = "#aa00dd";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.moveTo(spx, sy + 5);
            ctx.lineTo(spx - 3, sy + TILE_SIZE - 8);
            ctx.lineTo(spx + 3, sy + TILE_SIZE - 8);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else if (tile === 6) {
          // Exit portal
          const hue = (180 + Math.sin(gameTime * 0.05) * 30) | 0;
          const col = `hsl(${hue},100%,65%)`;
          ctx.fillStyle = "rgba(0,30,60,0.85)";
          ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE * 4);
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.shadowColor = col;
          ctx.shadowBlur = 16;
          ctx.strokeRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE * 4 - 2);
          ctx.shadowBlur = 0;

          // Swirl
          for (let i = 0; i < 7; i++) {
            const a = (i / 7) * Math.PI * 2 + gameTime * 0.07;
            const pr = 9 + Math.sin(gameTime * 0.12 + i) * 3;
            ctx.fillStyle = `hsla(${hue + i * 15},100%,75%,0.9)`;
            ctx.beginPath();
            ctx.arc(
              sx + TILE_SIZE / 2 + Math.cos(a) * pr,
              sy + TILE_SIZE * 0.55 + Math.sin(a) * pr,
              3,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
          ctx.fillStyle = "rgba(0,200,255,0.12)";
          ctx.fillRect(sx + 2, sy + 2, TILE_SIZE - 4, TILE_SIZE * 4 - 4);
          ctx.fillStyle = col;
          ctx.font = "bold 8px Courier New";
          ctx.textAlign = "center";
          ctx.fillText("EXIT", sx + TILE_SIZE / 2, sy + TILE_SIZE * 1.6);
        }
      }
    }
  }

  static drawPlayer(ctx, player, camera, gameTime) {
    if (player.dead) return;
    if (player.invincible > 0 && Math.floor(player.invincible / 4) % 2 === 1)
      return;

    const sx = Math.round(player.x - camera.x);
    const sy = Math.round(player.y - camera.y);
    const cx2 = sx + player.w / 2;
    const cy2 = sy + player.h / 2;

    // Glow aura
    const aura = ctx.createRadialGradient(cx2, cy2, 2, cx2, cy2, 26);
    aura.addColorStop(0, "rgba(0,180,255,0.18)");
    aura.addColorStop(1, "rgba(0,80,200,0)");
    ctx.fillStyle = aura;
    ctx.beginPath();
    ctx.arc(cx2, cy2, 26, 0, Math.PI * 2);
    ctx.fill();

    // Suit body
    ctx.fillStyle = "#081525";
    ctx.fillRect(sx + 3, sy + 10, player.w - 6, player.h - 12);
    ctx.fillStyle = "#112233";
    ctx.fillRect(sx + 5, sy + 12, player.w - 10, player.h - 24);

    // Chest glow
    const glowBr = 160 + Math.sin(gameTime * 0.09) * 40;
    ctx.fillStyle = `rgba(0,${glowBr | 0},255,0.85)`;
    ctx.fillRect(sx + player.w / 2 - 2, sy + 14, 4, player.h - 28);

    // Helmet
    ctx.fillStyle = "#060c18";
    ctx.fillRect(sx + 2, sy, player.w - 4, 14);
    const vg = ctx.createLinearGradient(sx + 4, sy + 2, sx + 4, sy + 12);
    vg.addColorStop(0, "#00ccff");
    vg.addColorStop(1, "#003d66");
    ctx.fillStyle = vg;
    ctx.fillRect(sx + 4, sy + 2, player.w - 8, 10);
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(sx + 5, sy + 3, 6, 3);
    ctx.fillStyle = "#00ccff";
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 8;
    ctx.fillRect(sx + 4, sy + 1, player.w - 8, 2);
    ctx.shadowBlur = 0;

    // Boots
    ctx.fillStyle = "#080f1c";
    ctx.fillRect(sx + 3, sy + player.h - 10, 8, 10);
    ctx.fillRect(sx + player.w - 11, sy + player.h - 10, 8, 10);
    ctx.fillStyle = "#002a55";
    ctx.fillRect(sx + 2, sy + player.h - 2, 10, 4);
    ctx.fillRect(sx + player.w - 12, sy + player.h - 2, 10, 4);
  }

  static drawEnemy(ctx, enemy, camera, gameTime) {
    if (enemy.dead) return;
    const sx = Math.round(enemy.x - camera.x);
    const sy = Math.round(enemy.y - camera.y);
    const ecx = sx + enemy.w / 2;
    const ecy = sy + enemy.h / 2;

    if (enemy.type === "flyer") {
      const wingFlap = Math.sin(enemy.animT * 0.3) * 8;
      ctx.globalAlpha = 0.2 + Math.sin(gameTime * 0.15) * 0.1;
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(ecx, ecy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#001a08";
      ctx.beginPath();
      ctx.ellipse(ecx, ecy, enemy.w * 0.4, enemy.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#003315";
      ctx.beginPath();
      ctx.moveTo(ecx, ecy - 2);
      ctx.lineTo(ecx - enemy.w * 1.2, ecy - wingFlap);
      ctx.lineTo(ecx - enemy.w * 0.5, ecy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(ecx, ecy - 2);
      ctx.lineTo(ecx + enemy.w * 1.2, ecy - wingFlap);
      ctx.lineTo(ecx + enemy.w * 0.5, ecy + 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#00ff66";
      ctx.shadowColor = "#00ff44";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(ecx - 4, ecy - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ecx + 4, ecy - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (enemy.type === "walker") {
      const glowAlpha = 0.15 + Math.sin(gameTime * 0.12) * 0.08;
      ctx.globalAlpha = glowAlpha;
      ctx.fillStyle = "#ff2200";
      ctx.beginPath();
      ctx.arc(ecx, ecy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0a1408";
      ctx.fillRect(sx, sy + 6, enemy.w, enemy.h - 6);
      ctx.fillStyle = "#142808";
      ctx.fillRect(sx + 2, sy + 8, enemy.w - 4, enemy.h - 12);
      ctx.fillStyle = "#080f04";
      ctx.fillRect(sx + 3, sy, enemy.w - 6, 10);
      ctx.fillStyle = "#ff2200";
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 6;
      ctx.fillRect(sx + 5, sy + 2, 4, 4);
      ctx.fillStyle = "#00ff44";
      ctx.fillRect(sx + enemy.w - 9, sy + 2, 4, 4);
      ctx.shadowBlur = 0;
    } else {
      const pulse = 0.5 + Math.sin(gameTime * 0.1) * 0.35;
      ctx.globalAlpha = pulse * 0.35;
      ctx.fillStyle = "#ff00bb";
      ctx.beginPath();
      ctx.arc(ecx, ecy, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#1a0018";
      ctx.beginPath();
      ctx.arc(ecx, ecy, enemy.w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#aa0055";
      ctx.beginPath();
      ctx.arc(ecx, ecy, enemy.w / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff00cc";
      ctx.shadowColor = "#ff00cc";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ecx, ecy - 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000";
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(ecx, ecy - 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  static drawCoin(ctx, coin, camera) {
    if (coin.taken) return;
    coin.bt += 0.06;
    const sx = coin.x - camera.x;
    const sy = coin.y + Math.sin(coin.bt) * 3 - camera.y;
    ctx.shadowColor = "#00ffcc";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#00ffaa";
    ctx.beginPath();
    ctx.arc(sx, sy, coin.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#aaffee";
    ctx.beginPath();
    ctx.arc(sx - 2, sy - 2, coin.r * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  static drawBullet(ctx, bullet, camera, color) {
    const sx = bullet.x - camera.x;
    const sy = bullet.y - camera.y;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.fillStyle = color;
    ctx.fillRect(sx - bullet.w / 2, sy - bullet.h / 2, bullet.w, bullet.h);
    ctx.globalAlpha = 0.3;
    ctx.fillRect(
      sx - bullet.vx * 2.5 - bullet.w / 2,
      sy - bullet.vy * 2.5 - bullet.h / 2,
      bullet.w,
      bullet.h,
    );
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }
}
