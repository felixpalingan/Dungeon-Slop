/**
 * Particle and Floating Comic Text FX Manager
 * Manages dust particles, roll sparks, and comic popups like 'SWOOSH!', 'DODGE!', 'BONK!'
 */

export class ParticleManager {
  constructor() {
    this.particles = [];
    this.comicTexts = [];
    this.onComicTextSpawned = null;
  }

  /**
   * Spawns floating comic text (e.g. 'DODGE!', 'SWOOSH!', 'BONK!', 'COOLDOWN 3.2s')
   */
  spawnComicText(x, y, text, color = '#ffea00', broadcast = true) {
    const isCooldown = text.includes('COOLDOWN');
    if (isCooldown) {
      // Clear any previous cooldown indicators so they never overlap into an unreadable mess
      this.comicTexts = this.comicTexts.filter((t) => !t.text.includes('COOLDOWN'));
    }

    this.comicTexts.push({
      x,
      y: y - (isCooldown ? 28 : 20),
      vx: isCooldown ? 0 : (Math.random() - 0.5) * 35,
      vy: isCooldown ? -42 : -65 - Math.random() * 30,
      text,
      color,
      alpha: 1.0,
      scale: isCooldown ? 1.25 : 1.4,
      rotation: isCooldown ? 0 : (Math.random() - 0.5) * 0.35,
      life: isCooldown ? 0.9 : 0.75
    });

    if (broadcast && !isCooldown && this.onComicTextSpawned) {
      this.onComicTextSpawned(x, y, text, color);
    }
  }

  /**
   * Spawns directional dash burst particles
   */
  spawnDashBurst(x, y, angle, color = '#00f0ff') {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 1.2;
      const speed = 80 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle + Math.PI + spread) * speed,
        vy: Math.sin(angle + Math.PI + spread) * speed,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 0.9,
        life: 0.35
      });
    }
  }

  update(dt) {
    // 1. Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= dt / p.life;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // 2. Update comic texts
    for (let i = this.comicTexts.length - 1; i >= 0; i--) {
      const t = this.comicTexts[i];
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.alpha -= dt / t.life;
      t.scale = Math.max(1.0, t.scale - dt * 1.2);
      if (t.alpha <= 0) {
        this.comicTexts.splice(i, 1);
      }
    }
  }

  /**
   * Renders particles and comic texts
   */
  draw(ctx) {
    // Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Comic Texts
    for (const t of this.comicTexts) {
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);
      ctx.scale(t.scale, t.scale);
      ctx.globalAlpha = Math.max(0, t.alpha);

      // Comic font styling
      ctx.font = '900 18px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Thick black comic outline
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(t.text, 0, 0);

      // Vibrant fill
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, 0, 0);

      ctx.restore();
    }
  }
}
