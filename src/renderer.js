/**
 * Procedural 2D Shape Renderer for Dungeon Slop
 * Renders characters with dynamic equipped gear (helmets, visors, horns, armor vests, boots, weapons, and shields)
 * using pure HTML5 Canvas vector math.
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
   * Draws character with full 6-slot procedural 2D visual equipment:
   * - Helmet: Horns, Visor, Cowl
   * - Chestpiece: Leather vest, Spiked cuirass, Celestial gold mantle
   * - Boots: Floating foot indicators
   * - Weapons: 1H Shortsword, Crystal Scimitar, 2H Titan Greatsword, 2H Warhammer
   * - Off-hand: Wooden Buckler, Tower Shield, Arcane Grimoire Tome
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
      attackProgress = 0,
      isSlapping = false,
      slapProgress = 0,
      equipment = {}
    } = entity;

    const ctx = this.ctx;

    ctx.save();
    ctx.translate(x, y);

    // Drop shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, radius + 5, radius * 1.15, radius * 0.45, 0, 0, Math.PI * 2);
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

    const weapon = equipment.weapon;
    const offhand = equipment.offhand;
    const helmet = equipment.helmet;
    const chest = equipment.chest;
    const boots = equipment.boots;
    const is2H = weapon && weapon.hands === 2;

    // --- SWORD ATTACK SLASH TRAIL ---
    if (isAttacking && attackProgress > 0 && attackProgress < 1) {
      ctx.save();
      const slashReach = is2H ? radius + 46 : radius + 30;
      const startAngle = -Math.PI * 0.48 + attackProgress * Math.PI * (is2H ? 1.3 : 0.9);
      const arcSpread = Math.PI * 0.6;

      ctx.beginPath();
      ctx.arc(0, 0, slashReach, startAngle - arcSpread, startAngle);
      ctx.strokeStyle = 'rgba(255, 255, 255, ' + (1 - attackProgress) + ')';
      ctx.lineWidth = is2H ? 6 : 4;
      ctx.shadowColor = is2H ? '#fbbf24' : '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.stroke();
      ctx.restore();
    }

    // --- VISUAL BOOTS / FEET (Underneath body) ---
    let bootColor = '#78350f';
    if (boots?.visual === 'winged_boots') bootColor = '#38bdf8';
    else if (boots?.visual === 'gojo_loafers') bootColor = '#020617';
    else if (boots?.visual === 'sukuna_zori') bootColor = '#d97706';
    else if (boots?.visual === 'toji_slippers') bootColor = '#1e293b';
    else if (boots?.visual === 'guts_sollerets') bootColor = '#0f172a';

    ctx.fillStyle = bootColor;
    ctx.beginPath();
    ctx.ellipse(-10, -radius * 0.6, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(-10, radius * 0.6, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings on boots if wind striders equipped
    if (boots?.visual === 'winged_boots') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-12, -radius * 0.7);
      ctx.lineTo(-18, -radius * 0.9);
      ctx.moveTo(-12, radius * 0.7);
      ctx.lineTo(-18, radius * 0.9);
      ctx.stroke();
    }

    // --- HANDS & WEAPONS ---
    const handRadius = 7;
    const handDistance = radius + 8;

    // LEFT HAND (Off-hand / Shield / 2H Grip)
    let leftHandX = 10;
    let leftHandY = -handDistance;

    if (is2H) {
      // Both hands grip the heavy 2-handed weapon!
      leftHandX = 16;
      leftHandY = 4;
    } else if (entity.isBlocking) {
      // Raise shield forward in defensive stance!
      leftHandX = 22;
      leftHandY = -6;
    } else if (isSlapping && slapProgress > 0 && slapProgress < 1) {
      const thrust = Math.sin(slapProgress * Math.PI) * 26;
      leftHandX += thrust;
      leftHandY += thrust * 0.3;
    }

    // Draw Left Hand & Off-hand if not 2-handed
    if (!is2H) {
      ctx.save();
      ctx.translate(leftHandX, leftHandY);

      // Off-hand item visual
      if (offhand) {
        if (offhand.visual === 'reversal_red') {
          // Gojo's Reversal Red floating glowing sphere
          const pulseRed = 8 + Math.sin(Date.now() * 0.008) * 2;
          ctx.beginPath();
          ctx.arc(0, 0, pulseRed, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14;
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (offhand.visual === 'sukuna_hiten') {
          // Sukuna Hiten Fire Spear
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-10, 0);
          ctx.lineTo(16, 0);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(16, -6);
          ctx.lineTo(26, 0);
          ctx.lineTo(16, 6);
          ctx.closePath();
          ctx.fill();
        } else if (offhand.visual === 'tower_shield') {
          // Iron Tower Shield (Tall rectangular steel shield with cross)
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(-6, -16, 12, 32, [4]);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Gold center crest
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-2, -6, 4, 12);
        } else if (offhand.visual === 'tome') {
          // Arcane Tome
          ctx.fillStyle = '#7e22ce';
          ctx.fillRect(-6, -10, 12, 20);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-6, -10, 12, 20);
        } else {
          // Default / Wooden Buckler
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }

      // Left hand circle
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.arc(0, 0, handRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // RIGHT HAND & MAIN WEAPON
    let rightHandX = 10;
    let rightHandY = handDistance;
    let swordAngle = 0;

    if (isAttacking && attackProgress > 0 && attackProgress < 1) {
      const swingArc = -Math.PI * 0.45 + attackProgress * Math.PI * (is2H ? 1.4 : 1.1);
      rightHandX = Math.cos(swingArc) * (handDistance + 3);
      rightHandY = Math.sin(swingArc) * (handDistance + 3);
      swordAngle = swingArc + Math.PI * 0.35;
    }

    ctx.save();
    ctx.translate(rightHandX, rightHandY);
    ctx.rotate(swordAngle);

    // If 2H weapon, draw second gripping hand on weapon hilt
    if (is2H) {
      ctx.save();
      ctx.translate(-4, -6);
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.arc(0, 0, handRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Main Hand Circle
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.arc(0, 0, handRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Procedural Weapon Visuals based on equipped item
    if (weapon?.visual === 'dragon_slayer') {
      // Guts' Colossal Dragon Slayer: 92px long massive slab of dark iron
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(58, -6);
      ctx.lineTo(66, 0); // sharp pointed iron apex
      ctx.lineTo(58, 6);
      ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Deep central blood fuller groove
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -2, 50, 4);

      // Chunky crossguard & hilt wrapping
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, -12, 5, 24);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-6, -2, 6, 4);
    } else if (weapon?.visual === 'inverted_spear_chain') {
      // Toji's Inverted Spear of Heaven & Coiled Chain
      // 1. Thousand-Mile Chain links
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(-14, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. Inverted Spear twin-curved jitte blade
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(10, -2);
      ctx.lineTo(38, -2);
      ctx.lineTo(44, 0);
      ctx.lineTo(38, 2);
      ctx.lineTo(10, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inverted jitte hook prong
      ctx.beginPath();
      ctx.moveTo(22, -2);
      ctx.lineTo(24, -10);
      ctx.lineTo(26, -10);
      ctx.lineTo(24, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (weapon?.visual === 'lapse_blue') {
      // Gojo's Lapse Blue floating gravitational sphere
      const pulseBlue = 9 + Math.sin(Date.now() * 0.009) * 2;
      ctx.beginPath();
      ctx.arc(14, 0, pulseBlue, 0, Math.PI * 2);
      ctx.fillStyle = '#0284c7';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
    } else if (weapon?.visual === 'sukuna_kamutoke') {
      // Sukuna's Vajra Lightning Dagger
      ctx.fillStyle = '#fbbf24';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(22, 0);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Lightning prongs
      ctx.strokeStyle = '#e11d48';
      ctx.strokeRect(10, -8, 4, 16);
    } else if (weapon?.visual === 'sukuna_cleaver') {
      // Sukuna's Malevolent Cleaver
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(46, -14);
      ctx.lineTo(50, 6);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (weapon?.visual === 'greatsword_2h') {
      // Colossal Titan Greatsword
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(44, -4);
      ctx.lineTo(52, 0);
      ctx.lineTo(44, 4);
      ctx.lineTo(0, 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing fuller line down center
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(40, 0);
      ctx.stroke();

      // Crossguard
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, -10, 4, 20);
    } else if (weapon?.visual === 'warhammer_2h') {
      // Thunder Warhammer
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(36, 0);
      ctx.stroke();

      // Heavy hammer block head
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.fillRect(28, -12, 14, 24);
      ctx.strokeRect(28, -12, 14, 24);
    } else if (weapon?.visual === 'crystal_blade') {
      // Crystal Scimitar
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -2);
      ctx.quadraticCurveTo(18, -8, 30, 0);
      ctx.lineTo(0, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Default Rusty Shortsword
      ctx.fillStyle = '#f7fafc';
      ctx.strokeStyle = '#cbd5e0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(26, -2.5);
      ctx.lineTo(32, 0);
      ctx.lineTo(26, 2.5);
      ctx.lineTo(0, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ecc94b';
      ctx.fillRect(2, -6, 3, 12);
    }

    ctx.restore();

    // --- MAIN BODY / TORSO CIRCLE ---
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // --- CHESTPIECE VISUAL ---
    if (chest) {
      if (chest.visual === 'gojo_tunic') {
        // High-collar black jujutsu sorcerer tunic with polished buttons
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.72, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();

        // High neck collar flap
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(radius * 0.1, -8, 8, 16);
      } else if (chest.visual === 'sukuna_robe') {
        // Flowing white kimono with sharp black cursed tattoos
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(-2, 0, radius * 0.75, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();

        // Cursed tattoo markings
        ctx.strokeStyle = '#090d16';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(8, -6);
        ctx.moveTo(-4, 6);
        ctx.lineTo(8, 6);
        ctx.stroke();
      } else if (chest.visual === 'toji_shirt') {
        // Tight black compression shirt with muscle shading
        ctx.fillStyle = '#0b0f19';
        ctx.beginPath();
        ctx.arc(-2, 0, radius * 0.7, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
      } else if (chest.visual === 'guts_berserker_plate') {
        // Jagged, angular black iron Berserker cuirass with red blood trim
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-2, 0, radius * 0.78, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();

        // Spiked pauldrons
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-8, -radius * 0.85, 8, 6);
        ctx.fillRect(-8, radius * 0.65, 8, 6);
      } else if (chest.visual === 'celestial_chest') {
        // Radiant golden wings / mantle
        ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.75, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();
      } else if (chest.visual === 'steel_chest') {
        // Spiked steel plate
        ctx.fillStyle = '#475569';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(-2, 0, radius * 0.7, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
        ctx.stroke();
      } else {
        // Leather tunic
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(-2, 0, radius * 0.65, -Math.PI / 2, Math.PI / 2);
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.arc(-2, 0, radius * 0.65, -Math.PI / 2, Math.PI / 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fill();
    }

    // --- HELMET / HEADPIECE VISUAL ---
    if (helmet?.visual === 'guts_beast_helm') {
      // Guts' Berserker Beast Helmet: Jagged demon hound snout with glowing red slits
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(radius * 0.1, -12);
      ctx.lineTo(radius * 0.9, -6);
      ctx.lineTo(radius * 1.1, 0); // sharp pointed beast snout
      ctx.lineTo(radius * 0.9, 6);
      ctx.lineTo(radius * 0.1, 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing crimson beast eye slits
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(radius * 0.5, -6, 6, 2.5);
      ctx.fillRect(radius * 0.5, 3.5, 6, 2.5);
      ctx.shadowBlur = 0;
    } else if (helmet?.visual === 'sukuna_crown') {
      // Sukuna's Four Eyes & forehead tattoos
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(radius * 0.2, -8, radius * 0.55, 16, [4]);
      ctx.fill();

      // 4 Glowing crimson demon eyes!
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 8;
      ctx.fillRect(radius * 0.35, -6, 4, 3);
      ctx.fillRect(radius * 0.35, 3, 4, 3);
      ctx.fillRect(radius * 0.6, -4, 3, 2.5);
      ctx.fillRect(radius * 0.6, 1.5, 3, 2.5);
      ctx.shadowBlur = 0;
    } else if (helmet?.visual === 'toji_worm') {
      // Toji's Cursed Worm wrapped around neck and shoulder
      ctx.fillStyle = '#64748b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(-radius * 0.4, -radius * 0.4, 8, 0, Math.PI * 2);
      ctx.arc(radius * 0.1, -radius * 0.5, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Normal head visor underneath
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(radius * 0.2, -7, radius * 0.55, 14, [4]);
      ctx.fill();
    } else if (helmet?.visual === 'gojo_blindfold') {
      // Gojo's jet black blindfold with glowing cyan eye slits
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(radius * 0.15, -8, radius * 0.6, 16, [3]);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Faint glowing Six Eyes slit
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.fillRect(radius * 0.45, -3, 3, 6);
      ctx.shadowBlur = 0;
    } else if (helmet?.visual === 'horned_helm') {
      // Fierce barbarian horns sticking out left and right
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(2, -radius * 0.6);
      ctx.quadraticCurveTo(14, -radius * 1.3, 2, -radius * 1.5);
      ctx.lineTo(-4, -radius * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(2, radius * 0.6);
      ctx.quadraticCurveTo(14, radius * 1.3, 2, radius * 1.5);
      ctx.lineTo(-4, radius * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Default Visor underneath
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(radius * 0.2, -7, radius * 0.55, 14, [4]);
      ctx.fill();
    } else {
      // Default / Cowl Visor
      const visorBaseColor = helmet?.visual === 'cowl_hood' ? '#1e1b4b' : '#0f172a';
      ctx.fillStyle = visorBaseColor;
      ctx.beginPath();
      ctx.roundRect(radius * 0.2, -7, radius * 0.55, 14, [4]);
      ctx.fill();

      // Visor glowing slit
      ctx.fillStyle = isRolling ? '#ffffff' : (isAttacking ? '#ff3366' : '#00f0ff');
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillRect(radius * 0.45, -4, 4, 8);
      ctx.shadowBlur = 0;
    }

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
