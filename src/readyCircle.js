/**
 * Ready Ritual Circle for the pre-game lobby
 * Tracks when all connected players stand inside and triggers the descent countdown.
 */

export class ReadyCircle {
  constructor(x = 0, y = 140, radius = 70) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.pulseTime = 0;
    this.countdown = 3.0; // 3 second countdown
    this.isCountingDown = false;
    this.allReady = false;
    this.onDescentTriggered = null;
  }

  isEntityInside(entity) {
    const dist = Math.hypot(entity.x - this.x, entity.y - this.y);
    return dist <= this.radius;
  }

  update(dt, localPlayer, remotePlayersMap) {
    this.pulseTime += dt * 3;

    // Check if local player is inside
    const localInside = this.isEntityInside(localPlayer);

    // Check if all remote players are inside
    let allRemotesInside = true;
    for (const [_, remote] of remotePlayersMap.entries()) {
      if (!this.isEntityInside(remote)) {
        allRemotesInside = false;
        break;
      }
    }

    // Party is ready if local player + all connected remotes are inside
    this.allReady = localInside && allRemotesInside;

    if (this.allReady) {
      this.isCountingDown = true;
      this.countdown -= dt;
      if (this.countdown <= 0) {
        this.countdown = 0;
        if (this.onDescentTriggered) {
          this.onDescentTriggered();
          this.onDescentTriggered = null; // trigger once
        }
      }
    } else {
      this.isCountingDown = false;
      this.countdown = 3.0; // reset countdown if someone steps out
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const pulse = Math.sin(this.pulseTime) * 4;
    const currentRadius = this.radius + pulse;

    // Outer runic circle
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.fillStyle = this.allReady ? 'rgba(0, 255, 136, 0.15)' : 'rgba(0, 240, 255, 0.06)';
    ctx.fill();

    ctx.strokeStyle = this.allReady ? '#00ff88' : '#00f0ff';
    ctx.lineWidth = 3;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = this.allReady ? 18 : 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner dashed ring
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = this.allReady ? 'rgba(0, 255, 136, 0.6)' : 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // Central runic rune glyph (four points)
    ctx.save();
    ctx.rotate(this.pulseTime * 0.2);
    ctx.fillStyle = this.allReady ? '#00ff88' : '#00f0ff';
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.45);
      ctx.lineTo(6, -this.radius * 0.25);
      ctx.lineTo(-6, -this.radius * 0.25);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Central countdown or instructions text
    ctx.font = '800 14px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 5;

    if (this.isCountingDown) {
      ctx.fillStyle = '#00ff88';
      const countDisplay = Math.ceil(this.countdown);
      ctx.font = '900 24px "JetBrains Mono", monospace';
      ctx.fillText(`DESCENDING IN ${countDisplay}...`, 0, 0);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillText('STAND HERE TO READY UP', 0, -6);
      ctx.font = '600 11px "Outfit", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('All party members must gather', 0, 12);
    }

    ctx.restore();
  }
}
