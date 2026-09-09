/**
 * Cinematic Ultimate & Special FX Manager for Dungeon Slop
 * Renders full-screen anime ultimate animations, screen flashes,
 * dimensional slashes, camera shake, and animated projectile orbs.
 */

export class CinematicManager {
  constructor() {
    this.activeCinematic = null; // { type, timer, duration, player, data }
    this.projectiles = []; // e.g. Hollow Purple orbs, Dismantle wind blades
    this.screenShake = 0;
    this.shakeDecay = 8; // decay per second
  }

  trigger(type, player) {
    const now = performance.now() / 1000;

    if (type === 'hollow_purple') {
      // Gojo's Hollow Purple: Screen collapses into dark purple vortex,
      // then launches a massive 160px expanding sphere along player's aim angle!
      this.activeCinematic = {
        type: 'hollow_purple',
        timer: 1.4,
        duration: 1.4,
        x: player.x,
        y: player.y,
        angle: player.angle
      };
      this.addScreenShake(18);

      // Spawn Hollow Purple projectile
      const speed = 680;
      this.projectiles.push({
        type: 'hollow_purple',
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * speed,
        vy: Math.sin(player.angle) * speed,
        radius: 48,
        maxRadius: 110,
        damage: 320,
        life: 1.6,
        color: '#c084fc',
        glow: '#a855f7'
      });
    } else if (type === 'world_cutting_slash') {
      // Sukuna's World Cutting Slash: Reality freezes in monochrome gray for 0.35s,
      // followed by a violent diagonal crimson dimensional rip bisecting the whole viewport
      this.activeCinematic = {
        type: 'world_cutting_slash',
        timer: 1.2,
        duration: 1.2,
        x: player.x,
        y: player.y,
        angle: player.angle
      };
      this.addScreenShake(26);

      // Spawn expanding dimensional cut wave
      const speed = 820;
      this.projectiles.push({
        type: 'world_cutting_slash',
        x: player.x,
        y: player.y,
        vx: Math.cos(player.angle) * speed,
        vy: Math.sin(player.angle) * speed,
        width: 220,
        damage: 350,
        life: 1.0,
        angle: player.angle
      });
    } else if (type === 'inverted_chain_rampage') {
      // Toji's Thousand-Mile Chain Whirlwind: 360-degree high-velocity iron chain storm
      this.activeCinematic = {
        type: 'inverted_chain_rampage',
        timer: 1.1,
        duration: 1.1,
        x: player.x,
        y: player.y,
        angle: player.angle
      };
      this.addScreenShake(12);
    } else if (type === 'berserker_rage') {
      // Guts' Berserker Beast Armor: Blood-red pulsing vignette, invulnerability for 6.0s,
      // and colossal CLANG ground ruptures
      player.isInvulnerable = true;
      player.currentSpeed = player.baseSpeed * 1.5;
      this.activeCinematic = {
        type: 'berserker_rage',
        timer: 6.0,
        duration: 6.0,
        player
      };
      this.addScreenShake(22);

      setTimeout(() => {
        if (player) {
          player.isInvulnerable = false;
          player.currentSpeed = player.baseSpeed;
        }
      }, 6000);
    } else if (type === 'dismantle') {
      // Sukuna's Base Q Dismantle: 3 rapid curved razor wind slashes
      for (let i = -1; i <= 1; i++) {
        const spreadAngle = player.angle + i * 0.18;
        this.projectiles.push({
          type: 'dismantle',
          x: player.x,
          y: player.y,
          vx: Math.cos(spreadAngle) * 720,
          vy: Math.sin(spreadAngle) * 720,
          angle: spreadAngle,
          damage: 75,
          life: 0.55
        });
      }
      this.addScreenShake(6);
    } else if (type === 'cannon_arm') {
      // Guts' Base Q Cannon Arm: Massive explosive blast in front of player
      this.addScreenShake(14);
      this.projectiles.push({
        type: 'cannon_arm',
        x: player.x + Math.cos(player.angle) * 35,
        y: player.y + Math.sin(player.angle) * 35,
        vx: Math.cos(player.angle) * 580,
        vy: Math.sin(player.angle) * 580,
        radius: 36,
        damage: 130,
        life: 0.45
      });
    }
  }

  addScreenShake(amount) {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  getShakeOffset() {
    if (this.screenShake <= 0.1) return { x: 0, y: 0 };
    return {
      x: (Math.random() - 0.5) * this.screenShake * 2,
      y: (Math.random() - 0.5) * this.screenShake * 2
    };
  }

  update(dt, targets = [], onHitCallback = null) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - this.shakeDecay * dt * this.screenShake);
    }

    // Active full-screen cinematic timer
    if (this.activeCinematic) {
      this.activeCinematic.timer -= dt;
      if (this.activeCinematic.timer <= 0) {
        this.activeCinematic = null;
      }
    }

    // Update projectiles & hit detection
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx * dt;
      proj.y += proj.vy * dt;
      proj.life -= dt;

      // Expand projectile radius if applicable (Hollow Purple)
      if (proj.radius && proj.maxRadius) {
        proj.radius = Math.min(proj.maxRadius, proj.radius + 45 * dt);
      }

      // Check collision with targets (Dummy, etc.)
      for (const target of targets) {
        if (!target) continue;
        const dx = target.x - proj.x;
        const dy = target.y - proj.y;
        const dist = Math.hypot(dx, dy);
        const hitRadius = (proj.radius || 40) + (target.radius || 24);

        if (dist <= hitRadius && !proj.hasHit) {
          proj.hasHit = true;
          if (onHitCallback) {
            onHitCallback(target, proj);
          }
        }
      }

      if (proj.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Draws world-space cinematic effects (projectiles, slashes, chain whirlwinds)
   */
  drawWorld(ctx) {
    // 1. Draw Projectiles
    for (const proj of this.projectiles) {
      ctx.save();
      ctx.translate(proj.x, proj.y);

      if (proj.type === 'hollow_purple') {
        // Glowing Singularity Core + Outward Crackling Rays
        const pulse = 1 + Math.sin(Date.now() * 0.02) * 0.12;
        const r = proj.radius * pulse;

        // Outer Dark Purple Gravity Well
        const grad = ctx.createRadialGradient(0, 0, r * 0.15, 0, 0, r);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.25, '#c084fc');
        grad.addColorStop(0.65, '#9333ea');
        grad.addColorStop(1, 'rgba(30, 10, 60, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // High Voltage Core
        ctx.fillStyle = '#fdf4ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Orbiting energy streaks
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, Date.now() * 0.01, Date.now() * 0.01 + Math.PI);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.85, -Date.now() * 0.015, -Date.now() * 0.015 + Math.PI);
        ctx.stroke();
      } else if (proj.type === 'world_cutting_slash') {
        // Razor sharp dimensional rip blade
        ctx.rotate(proj.angle);
        ctx.strokeStyle = '#ff2a5f';
        ctx.shadowColor = '#ff2a5f';
        ctx.shadowBlur = 28;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(-110, 0);
        ctx.lineTo(110, 0);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-90, 0);
        ctx.lineTo(90, 0);
        ctx.stroke();
      } else if (proj.type === 'dismantle') {
        // Red curved wind blade
        ctx.rotate(proj.angle);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 36, -Math.PI * 0.3, Math.PI * 0.3);
        ctx.stroke();
      } else if (proj.type === 'cannon_arm') {
        // Explosive shell fireball
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, proj.radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 2. Toji's Inverted Chain Rampage Whirlwind in world
    if (this.activeCinematic && this.activeCinematic.type === 'inverted_chain_rampage') {
      const c = this.activeCinematic;
      const progress = 1 - c.timer / c.duration;
      const sweepAngle = progress * Math.PI * 8; // spins 4 complete revolutions!
      const maxRange = 135;

      ctx.save();
      ctx.translate(c.x, c.y);

      // Glowing Iron Chain Arc
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, maxRange, sweepAngle - Math.PI * 0.9, sweepAngle);
      ctx.stroke();

      // Chain links
      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, maxRange * 0.8, sweepAngle - Math.PI * 0.7, sweepAngle);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inverted Spear tip at end of chain
      const tipX = Math.cos(sweepAngle) * maxRange;
      const tipY = Math.sin(sweepAngle) * maxRange;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(tipX, tipY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draws full-screen canvas overlays (Post-Processing Vignettes, Screen Slices, Color Tinting)
   */
  drawScreenOverlay(ctx, width, height) {
    if (!this.activeCinematic) return;

    const c = this.activeCinematic;
    const progress = 1 - c.timer / c.duration;

    if (c.type === 'hollow_purple') {
      // Screen collapses into dark purple cosmic vignette
      const alpha = Math.sin(progress * Math.PI) * 0.65;
      ctx.save();
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 0.75);
      grad.addColorStop(0, 'rgba(147, 51, 234, 0)');
      grad.addColorStop(1, `rgba(45, 10, 80, ${alpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Electric flash on launch
      if (progress < 0.25) {
        ctx.fillStyle = `rgba(255, 255, 255, ${(0.25 - progress) * 1.5})`;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    } else if (c.type === 'world_cutting_slash') {
      // 1. Reality freeze: Desaturate / darken screen
      ctx.save();
      if (progress < 0.35) {
        ctx.fillStyle = 'rgba(15, 15, 25, 0.45)';
        ctx.fillRect(0, 0, width, height);
      } else {
        // 2. Full-screen diagonal dimensional slash bisecting the screen!
        const slashProgress = (progress - 0.35) / 0.65;
        const slashAlpha = Math.max(0, 1 - slashProgress);

        ctx.strokeStyle = `rgba(255, 42, 95, ${slashAlpha})`;
        ctx.lineWidth = 14;
        ctx.shadowColor = '#ff2a5f';
        ctx.shadowBlur = 32;

        ctx.beginPath();
        ctx.moveTo(0, height * 0.15);
        ctx.lineTo(width, height * 0.85);
        ctx.stroke();

        // White core cut line
        ctx.strokeStyle = `rgba(255, 255, 255, ${slashAlpha * 1.2})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, height * 0.15);
        ctx.lineTo(width, height * 0.85);
        ctx.stroke();

        // Shift canvas halves slightly along the cut
        ctx.fillStyle = `rgba(255, 0, 80, ${slashAlpha * 0.15})`;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.restore();
    } else if (c.type === 'berserker_rage') {
      // Pulsing blood-red vignette around screen edges
      const pulse = 0.35 + Math.sin(Date.now() * 0.008) * 0.2;
      ctx.save();
      const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.3, width / 2, height / 2, width * 0.75);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(1, `rgba(220, 20, 20, ${pulse})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
