/**
 * Procedural 2D Shape Renderer for Dungeon Slop
 * Renders characters, gear, hands, weapon silhouettes, attack slash arcs, and dungeon stone grid tiles using pure Canvas 2D math.
 */

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    this.camera = { x: 0, y: 0, zoom: 1.0 };
    this.tileSize = 64;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  clear() {
    this.ctx.fillStyle = '#08090d';
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  beginCamera(targetX, targetY) {
    this.camera.x = targetX;
    this.camera.y = targetY;

    this.ctx.save();
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this.camera.zoom, this.camera.zoom);
    this.ctx.translate(-this.camera.x, -this.camera.y);
  }

  endCamera() {
    this.ctx.restore();
  }

  drawDungeonFloor(bounds = { minX: -800, minY: -800, maxX: 800, maxY: 800 }) {
    const ctx = this.ctx;
    const size = this.tileSize;

    const startCol = Math.floor(bounds.minX / size);
    const endCol = Math.ceil(bounds.maxX / size);
    const startRow = Math.floor(bounds.minY / size);
    const endRow = Math.ceil(bounds.maxY / size);

    for (let col = startCol; col < endCol; col++) {
      for (let row = startRow; row < endRow; row++) {
        const x = col * size;
        const y = row * size;
        const hash = Math.abs(Math.sin(col * 12.9898 + row * 78.233) * 43758.5453) % 1;
        const baseShade = 16 + Math.floor(hash * 8);
        ctx.fillStyle = `rgb(${baseShade}, ${baseShade + 2}, ${baseShade + 6})`;
        ctx.fillRect(x, y, size, size);

        ctx.strokeStyle = '#0e1118';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, size, size);

        if (hash > 0.8) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
          ctx.fillRect(x + 10, y + 10, size - 20, size - 20);
        } else if (hash < 0.15) {
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.moveTo(x + 16, y + 20);
          ctx.lineTo(x + 28, y + 36);
          ctx.lineTo(x + 44, y + 32);
          ctx.stroke();
        }
      }
    }

    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 12;
    ctx.strokeRect(bounds.minX, bounds.minY, bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(bounds.minX + 6, bounds.minY + 6, bounds.maxX - bounds.minX - 12, bounds.maxY - bounds.minY - 12);
  }

  drawAfterImages(afterImages) {
    const ctx = this.ctx;
    for (const img of afterImages) {
      ctx.save();
      ctx.translate(img.x, img.y);
      ctx.rotate(img.angle);
      ctx.globalAlpha = Math.max(0, img.alpha);
      ctx.fillStyle = img.color;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Draws character with dynamic attack animations:
   * - Left-click sword slash: swinging weapon arc + glowing visual swipe trail
   * - Right-click slap: extended punching hand thrust
   */
  drawCharacter(entity) {
    const {
      x,
      y,
      radius = 22,
      angle = 0,
      color = '#00f0ff',
      isRolling = false,
      name = 'Player',
      isAttacking = false,
      attackProgress = 0, // 0 to 1
      isSlapping = false,
      slapProgress = 0
    } = entity;

    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, radius + 4, radius * 1.1, radius * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();
    ctx.restore();

    // Rotate facing mouse direction
    ctx.rotate(angle);

    // Rolling after-image/blur outline
    if (isRolling) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- SWORD ATTACK SLASH TRAIL (Glow arc in front of player) ---
    if (isAttacking && attackProgress > 0 && attackProgress < 1) {
      ctx.save();
      const startAngle = -Math.PI * 0.45 + attackProgress * Math.PI * 0.85;
      const arcSpread = Math.PI * 0.5;
      const slashRadius = radius + 28;

      ctx.beginPath();
      ctx.arc(0, 0, slashRadius, startAngle - arcSpread, startAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - attackProgress) + ')';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.stroke();

      // Outer faint blade aura
      ctx.beginPath();
      ctx.arc(0, 0, slashRadius + 4, startAngle - arcSpread * 0.8, startAngle);
      ctx.strokeStyle = 'rgba(0, 240, 255, ' + (0.6 * (1 - attackProgress)) + ')';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();
    }

    // --- HANDS & WEAPONS ---
    const handRadius = 7;
    const handDistance = radius + 8;

    // LEFT HAND (Off-hand / Shield / Slap Thrust)
    let leftHandX = 10;
    let leftHandY = -handDistance;

    if (isSlapping && slapProgress > 0 && slapProgress < 1) {
      // Thrust hand forward rapidly
      const thrust = Math.sin(slapProgress * Math.PI) * 26;
      leftHandX += thrust;
      leftHandY += thrust * 0.3;
    }

    ctx.save();
    ctx.translate(leftHandX, leftHandY);

    // Off-hand shield
    ctx.fillStyle = '#4a5568';
    ctx.beginPath();
    ctx.roundRect(-4, -9, 8, 18, [3]);
    ctx.fill();
    ctx.strokeStyle = '#a0aec0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left hand circle
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(0, 0, handRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    // RIGHT HAND (Weapon / Sword Slash Animation)
    let rightHandX = 10;
    let rightHandY = handDistance;
    let swordAngle = 0;

    if (isAttacking && attackProgress > 0 && attackProgress < 1) {
      // Swing arc calculation: wind up slightly back, then swing forward dynamically
      const swingArc = -Math.PI * 0.4 + attackProgress * Math.PI * 1.1;
      rightHandX = Math.cos(swingArc) * (handDistance + 2);
      rightHandY = Math.sin(swingArc) * (handDistance + 2);
      swordAngle = swingArc + Math.PI * 0.35;
    }

    ctx.save();
    ctx.translate(rightHandX, rightHandY);
    ctx.rotate(swordAngle);

    // Right hand circle
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(0, 0, handRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Procedural Sword Blade
    ctx.fillStyle = '#f7fafc';
    ctx.strokeStyle = '#cbd5e0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -2.5);
    ctx.lineTo(26, -2.5);
    ctx.lineTo(32, 0); // sharp blade tip
    ctx.lineTo(26, 2.5);
    ctx.lineTo(0, 2.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sword Crossguard
    ctx.fillStyle = '#ecc94b';
    ctx.fillRect(2, -6, 3, 12);

    ctx.restore();

    // --- TORSO / MAIN BODY CIRCLE ---
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Armor plate
    ctx.beginPath();
    ctx.arc(-2, 0, radius * 0.65, -Math.PI / 2, Math.PI / 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fill();

    // Helmet Visor
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(radius * 0.2, -7, radius * 0.55, 14, [4]);
    ctx.fill();

    // Glowing Visor slit
    ctx.fillStyle = isRolling ? '#ffffff' : (isAttacking ? '#ff3366' : '#00f0ff');
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.fillRect(radius * 0.45, -4, 4, 8);
    ctx.shadowBlur = 0;

    ctx.restore();

    // Overhead Name & Mini HP Bar
    ctx.save();
    ctx.translate(x, y - radius - 18);
    ctx.font = '600 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(name, 0, -6);
    ctx.shadowBlur = 0;

    const barWidth = 36;
    const barHeight = 4;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-barWidth / 2, 0, barWidth, barHeight);
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(-barWidth / 2, 0, barWidth * ((entity.hp ?? 100) / (entity.maxHp ?? 100)), barHeight);
    ctx.restore();
  }

  drawTorch(x, y, time = 0) {
    const ctx = this.ctx;
    const flicker = Math.sin(time * 8 + x) * 2;

    const grad = ctx.createRadialGradient(x, y, 4, x, y, 48 + flicker);
    grad.addColorStop(0, 'rgba(255, 170, 50, 0.25)');
    grad.addColorStop(1, 'rgba(255, 120, 20, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 48 + flicker, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffaa33';
    ctx.beginPath();
    ctx.arc(x, y, 5 + flicker * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}
