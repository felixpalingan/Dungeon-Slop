/**
 * In-World Customization Mirror Entity for Dungeon Slop
 * An interactive wooden dressing mirror / dye station in the lobby where players walk up,
 * press [E], and customize their Adventurer Name and Color Hue right in the game world.
 */

export class CustomizationStation {
  constructor(x = -220, y = -140) {
    this.x = x;
    this.y = y;
    this.radius = 28;
    this.interactionRadius = 55;
    this.pulseTime = 0;
  }

  isPlayerNearby(player) {
    return Math.hypot(player.x - this.x, player.y - this.y) <= this.interactionRadius;
  }

  update(dt) {
    this.pulseTime += dt * 3.5;
  }

  draw(ctx, player) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const isNear = this.isPlayerNearby(player);

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(0, 18, 22, 9, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Wooden desk / vanity table base
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-18, -4, 36, 14);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -4, 36, 14);

    // Mirror frame (gold / brass ornate oval)
    ctx.beginPath();
    ctx.ellipse(0, -18, 16, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b45309';
    ctx.fill();
    ctx.strokeStyle = isNear ? '#00f0ff' : '#d97706';
    ctx.lineWidth = 3;
    if (isNear) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Reflective glass mirror surface
    ctx.beginPath();
    ctx.ellipse(0, -18, 12, 18, 0, 0, Math.PI * 2);
    const grad = ctx.createLinearGradient(-10, -32, 10, -4);
    grad.addColorStop(0, 'rgba(180, 240, 255, 0.85)');
    grad.addColorStop(0.5, 'rgba(100, 200, 255, 0.6)');
    grad.addColorStop(1, 'rgba(30, 90, 160, 0.8)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Subtle glass reflection highlight streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -30);
    ctx.lineTo(6, -6);
    ctx.stroke();

    // Dye jars on table (little colored orbs on desk)
    const dyeColors = ['#ff3366', '#00f0ff', '#00ff88', '#ffb800'];
    dyeColors.forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(-12 + i * 8, 3, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    });

    ctx.restore();

    // Floating Overhead Prompt / Sign
    ctx.save();
    ctx.translate(this.x, this.y - 48);

    if (isNear) {
      // Interactive [E] prompt
      const bounce = Math.sin(this.pulseTime) * 3;
      ctx.translate(0, bounce);

      ctx.font = '800 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
      ctx.shadowBlur = 6;
      ctx.fillText('[E] WARDROBE & DYES', 0, 0);

      ctx.font = '600 10px "Outfit", sans-serif';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('Change Name & Colors', 0, 14);
    } else {
      ctx.font = '700 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#94a3b8';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText('WARDROBE', 0, 0);
    }

    ctx.restore();
  }
}
