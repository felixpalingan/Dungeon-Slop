import { ItemRarity } from './items.js';

/**
 * Ground Loot Item Entity for Dungeon Slop
 * Dropped items on the dungeon floor with vertical bobbing, glowing rarity beams,
 * and proximity [E] pickup.
 */

export class GroundLoot {
  constructor(item, x, y, id = null) {
    this.id = id || `loot_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.item = item;
    this.x = x;
    this.y = y;
    this.pickupRadius = 38;
    this.time = Math.random() * Math.PI * 2;
  }

  update(dt) {
    this.time += dt * 3.5;
  }

  isNear(player) {
    return Math.hypot(player.x - this.x, player.y - this.y) <= this.pickupRadius;
  }

  draw(ctx, isNear = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    const rarityInfo = ItemRarity[this.item.rarity] || ItemRarity.COMMON;
    const bob = Math.sin(this.time) * 4;

    // Drop shadow
    ctx.beginPath();
    ctx.ellipse(0, 10, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Glowing vertical rarity pillar/beam
    const beamGrad = ctx.createLinearGradient(0, -32, 0, 8);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    beamGrad.addColorStop(0.5, rarityInfo.color + '44');
    beamGrad.addColorStop(1, rarityInfo.color + 'aa');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(-6, -28 + bob, 12, 34);

    // Glowing floating diamond / loot icon
    ctx.save();
    ctx.translate(0, bob);
    ctx.rotate(this.time * 0.8);

    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(8, 0);
    ctx.lineTo(0, 10);
    ctx.lineTo(-8, 0);
    ctx.closePath();

    ctx.fillStyle = rarityInfo.color;
    ctx.shadowColor = rarityInfo.color;
    ctx.shadowBlur = 10;
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();

    // Floating item name tag
    ctx.font = '700 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rarityInfo.color;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText(this.item.name, 0, -22 + bob);

    if (isNear) {
      ctx.font = '800 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('[E] PICK UP', 0, 24);
    }

    ctx.restore();
  }
}
