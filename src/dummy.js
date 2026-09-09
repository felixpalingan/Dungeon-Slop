/**
 * Training Dummy entity for the pre-game lobby
 * Tracks DPS, total damage taken, wobble animation, and comic popups.
 */

export class Dummy {
  constructor(x = 0, y = -140) {
    this.baseX = x;
    this.baseY = y;
    this.x = x;
    this.y = y;
    this.offsetX = 0;
    this.offsetY = 0;
    this.offsetVx = 0;
    this.offsetVy = 0;
    this.radius = 24;
    this.wobbleAngle = 0;
    this.wobbleVelocity = 0;
    this.totalDamage = 0;
    this.lastHitTime = 0;
    this.recentDamage = 0;
    this.dps = 0;
    this.dpsWindow = []; // { time, damage }
    this.isStunned = false;
    this.stunTimer = 0;
  }

  takeHit(damage = 10, hitAngle = 0, knockback = 0) {
    this.totalDamage += damage;
    const now = performance.now() / 1000;
    this.lastHitTime = now;

    // Apply wobble impulse perpendicular to hit angle
    this.wobbleVelocity = (Math.random() > 0.5 ? 1 : -1) * (damage * 0.08);

    // Physical displacement impulse (negative knockback pulls inward e.g. Gojo Blue)
    if (knockback !== 0) {
      this.offsetVx += Math.cos(hitAngle) * knockback * 0.35;
      this.offsetVy += Math.sin(hitAngle) * knockback * 0.35;
    }

    // Track DPS over 3 second window
    this.dpsWindow.push({ time: now, damage });
  }

  pullTowards(targetX, targetY, strength = 35) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 1) {
      this.offsetVx += (dx / dist) * strength * 14;
      this.offsetVy += (dy / dist) * strength * 14;
    }
    this.wobbleVelocity = -14;
  }

  applyStun(duration = 2.5) {
    this.isStunned = true;
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  update(dt) {
    const now = performance.now() / 1000;

    // Update stun
    if (this.isStunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.stunTimer = 0;
      }
    }

    // Damped spring physics for wobble animation
    const springForce = -this.wobbleAngle * 45;
    const damping = -this.wobbleVelocity * 7;
    this.wobbleVelocity += (springForce + damping) * dt;
    this.wobbleAngle += this.wobbleVelocity * dt;

    // Damped spring physics for displacement offset (returns to base position)
    const posSpring = 60;
    const posDamp = 8;
    this.offsetVx += (-this.offsetX * posSpring - this.offsetVx * posDamp) * dt;
    this.offsetVy += (-this.offsetY * posSpring - this.offsetVy * posDamp) * dt;
    this.offsetX += this.offsetVx * dt;
    this.offsetY += this.offsetVy * dt;

    this.x = this.baseX + this.offsetX;
    this.y = this.baseY + this.offsetY;

    // Clean up DPS window older than 3 seconds
    this.dpsWindow = this.dpsWindow.filter((entry) => now - entry.time <= 3);
    const sumDamage = this.dpsWindow.reduce((sum, e) => sum + e.damage, 0);
    this.dps = this.dpsWindow.length > 0 ? Math.round(sumDamage / 3) : 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(0, this.radius + 6, this.radius * 1.1, this.radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Rotate with wobble physics
    ctx.rotate(this.wobbleAngle);

    // Wooden post base
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.fillRect(-6, -this.radius, 12, this.radius * 2);
    ctx.strokeRect(-6, -this.radius, 12, this.radius * 2);

    // Straw body sack
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius, this.radius * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cross-stitching target on dummy chest
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 10);
    ctx.stroke();

    // Bullseye outer ring
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Straw dummy head
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, -this.radius - 8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    // Stunned spinning stars over head
    if (this.isStunned) {
      const starTime = performance.now() * 0.006;
      for (let s = 0; s < 3; s++) {
        const starAngle = starTime + (s * Math.PI * 2) / 3;
        const starX = Math.cos(starAngle) * 18;
        const starY = -this.radius - 22 + Math.sin(starAngle) * 7;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(starX, starY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    ctx.restore();

    // Floating DPS and damage stats above dummy
    ctx.save();
    ctx.translate(this.x, this.y - this.radius - 32);

    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffb800';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText('TRAINING DUMMY', 0, -12);

    if (this.dps > 0) {
      ctx.font = '700 11px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ff88';
      ctx.fillText(`${this.dps} DPS (${this.totalDamage} Total)`, 0, 2);
    } else {
      ctx.font = '500 10px "Outfit", sans-serif';
      ctx.fillStyle = '#a0aec0';
      ctx.fillText('Smack me to test damage!', 0, 2);
    }

    ctx.restore();
  }
}
