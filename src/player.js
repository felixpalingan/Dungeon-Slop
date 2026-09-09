/**
 * Player Entity for Dungeon Slop
 * Handles movement, stamina, Left Shift Dodge Roll, aiming, and attack animations.
 */

export class Player {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 22;
    this.angle = 0;
    this.name = 'SlopCrawler';
    this.color = '#00f0ff';

    // Stats
    this.hp = 100;
    this.maxHp = 100;
    this.baseSpeed = 260; // pixels/sec
    this.currentSpeed = this.baseSpeed;

    // Stamina & Roll / Dash
    this.stamina = 100;
    this.maxStamina = 100;
    this.staminaRegen = 32;
    this.rollCost = 35;

    // Roll state
    this.isRolling = false;
    this.rollDuration = 0.28;
    this.rollTimer = 0;
    this.rollSpeedMultiplier = 2.4;
    this.rollDirX = 1;
    this.rollDirY = 0;
    this.afterImages = [];

    // Knockback physics (for friendly slaps & enemy hits)
    this.knockbackVx = 0;
    this.knockbackVy = 0;

    // Weapon Attack Animation (Left Click) & Cooldown
    this.isAttacking = false;
    this.attackDuration = 0.22; // snappy, satisfying swing
    this.attackTimer = 0;
    this.attackProgress = 0; // 0 to 1
    this.attackCooldownTimer = 0; // prevents click spamming

    // Offhand / Slap Animation (Right Click) & Cooldown
    this.isSlapping = false;
    this.slapDuration = 0.18;
    this.slapTimer = 0;
    this.slapProgress = 0; // 0 to 1
    this.slapCooldownTimer = 0;

    // Stun status effect (e.g. Spartan Kick)
    this.isStunned = false;
    this.stunTimer = 0;

    // Lunge momentum physics (e.g. Spartan Kick forward thrust)
    this.lungeTimer = 0;
    this.lungeDuration = 0;
    this.lungeVx = 0;
    this.lungeVy = 0;

    // Shield Blocking state
    this.isBlocking = false;

    // 6 Equipment Slots
    this.equipment = {
      helmet: null,
      chest: null,
      pants: null,
      boots: null,
      weapon: null,
      offhand: null
    };

    // Inventory backpack slots (holds up to 10 unequipped items)
    this.inventory = [];
    this.maxInventorySize = 10;
  }

  triggerAttack() {
    if (this.isStunned || this.isAttacking || this.attackCooldownTimer > 0) return false;
    this.isAttacking = true;
    const weapon = this.equipment?.weapon;
    const speed = weapon?.speed || 1.0;
    this.attackDuration = Math.max(0.12, 0.22 / speed);
    this.attackCooldownTimer = Math.max(0.18, 0.32 / speed);
    this.attackTimer = this.attackDuration;
    this.attackProgress = 0;
    return true;
  }

  triggerSlap() {
    if (this.isStunned || this.isSlapping || this.slapCooldownTimer > 0) return false;
    this.isSlapping = true;
    this.slapTimer = this.slapDuration;
    this.slapCooldownTimer = 0.24;
    this.slapProgress = 0;
    return true;
  }

  startLunge(angle, speed = 850, duration = 0.26) {
    this.lungeTimer = duration;
    this.lungeDuration = duration;
    this.lungeVx = Math.cos(angle) * speed;
    this.lungeVy = Math.sin(angle) * speed;
  }

  applyStun(duration = 2.5) {
    this.isStunned = true;
    this.stunTimer = Math.max(this.stunTimer, duration);
    this.isAttacking = false;
    this.isBlocking = false;
  }

  applyKnockback(kx, ky) {
    this.knockbackVx = kx;
    this.knockbackVy = ky;
  }

  /**
   * Equips an item into its designated slot.
   * If equipping a 2-handed weapon, un-equips the off-hand automatically.
   * If equipping an off-hand while holding a 2-handed weapon, un-equips the 2H weapon!
   */
  equipItem(item) {
    if (!item || !item.slot) return null;

    let unequippedItems = [];

    if (item.slot === 'weapon') {
      // If equipping 2-handed weapon, must unequip offhand
      if (item.hands === 2 && this.equipment.offhand) {
        unequippedItems.push(this.equipment.offhand);
        this.equipment.offhand = null;
      }
      if (this.equipment.weapon) {
        unequippedItems.push(this.equipment.weapon);
      }
      this.equipment.weapon = item;
    } else if (item.slot === 'offhand') {
      // Cannot equip offhand if currently holding a 2H weapon; unequip the 2H weapon
      if (this.equipment.weapon && this.equipment.weapon.hands === 2) {
        unequippedItems.push(this.equipment.weapon);
        this.equipment.weapon = null;
      }
      if (this.equipment.offhand) {
        unequippedItems.push(this.equipment.offhand);
      }
      this.equipment.offhand = item;
    } else {
      // Armor slots (helmet, chest, pants, boots)
      if (this.equipment[item.slot]) {
        unequippedItems.push(this.equipment[item.slot]);
      }
      this.equipment[item.slot] = item;
    }

    this.recalculateStats();
    return unequippedItems;
  }

  unequipSlot(slot) {
    if (!this.equipment[slot]) return null;
    const removed = this.equipment[slot];
    this.equipment[slot] = null;
    this.recalculateStats();
    return removed;
  }

  recalculateStats() {
    let bonusHp = 0;
    let bonusSpeed = 0;
    let bonusStaminaRegen = 0;
    let rollCostReduction = 0;

    for (const slot in this.equipment) {
      const item = this.equipment[slot];
      if (!item) continue;
      if (item.hp) bonusHp += item.hp;
      if (item.speedBonus) bonusSpeed += item.speedBonus;
      if (item.staminaRegen) bonusStaminaRegen += item.staminaRegen;
      if (item.rollCostReduction) rollCostReduction += item.rollCostReduction;
    }

    this.maxHp = 100 + bonusHp;
    this.hp = Math.min(this.hp, this.maxHp);
    this.baseSpeed = 260 + bonusSpeed;
    this.staminaRegen = 32 + bonusStaminaRegen;
    this.rollCost = Math.max(15, 35 - rollCostReduction);
  }

  update(dt, input, bounds = { minX: -580, minY: -580, maxX: 580, maxY: 580 }) {
    // 0. Cooldown timers
    this.attackCooldownTimer = Math.max(0, this.attackCooldownTimer - dt);
    this.slapCooldownTimer = Math.max(0, this.slapCooldownTimer - dt);

    // Stun check
    if (this.isStunned) {
      this.stunTimer -= dt;
      if (this.stunTimer <= 0) {
        this.isStunned = false;
        this.stunTimer = 0;
      }
      this.vx = 0;
      this.vy = 0;
      this.x += this.knockbackVx * dt;
      this.y += this.knockbackVy * dt;
      this.knockbackVx *= Math.pow(0.001, dt);
      this.knockbackVy *= Math.pow(0.001, dt);
      return;
    }

    // 1. Mouse Aiming angle
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    this.angle = Math.atan2(input.mouse.screenY - screenCenterY, input.mouse.screenX - screenCenterX);

    // 2. Weapon Attack Animation update
    if (this.isAttacking) {
      this.attackTimer -= dt;
      this.attackProgress = 1 - Math.max(0, this.attackTimer / this.attackDuration);
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
        this.attackProgress = 0;
      }
    }

    // 3. Slap Animation update
    if (this.isSlapping) {
      this.slapTimer -= dt;
      this.slapProgress = 1 - Math.max(0, this.slapTimer / this.slapDuration);
      if (this.slapTimer <= 0) {
        this.isSlapping = false;
        this.slapProgress = 0;
      }
    }

    // Lunge physics (e.g. Spartan Kick forward thrust)
    if (this.lungeTimer > 0) {
      this.lungeTimer -= dt;
      this.vx = this.lungeVx;
      this.vy = this.lungeVy;
      if (Math.random() < 0.6) {
        this.afterImages.push({
          x: this.x,
          y: this.y,
          angle: this.angle,
          color: '#38bdf8',
          alpha: 0.55
        });
      }
    } else if (this.isRolling) {
      // 4. Roll / Dash state
      this.rollTimer -= dt;

      if (Math.random() < 0.65) {
        this.afterImages.push({
          x: this.x,
          y: this.y,
          angle: this.angle,
          color: this.color,
          alpha: 0.55
        });
      }

      this.vx = this.rollDirX * this.baseSpeed * this.rollSpeedMultiplier;
      this.vy = this.rollDirY * this.baseSpeed * this.rollSpeedMultiplier;

      if (this.rollTimer <= 0) {
        this.isRolling = false;
      }
    } else {
      // 5. Normal Movement
      const { dx, dy } = input.getMovementVector();

      if (input.justPressedShift && this.stamina >= this.rollCost) {
        this.isRolling = true;
        this.rollTimer = this.rollDuration;
        this.stamina -= this.rollCost;

        if (dx !== 0 || dy !== 0) {
          this.rollDirX = dx;
          this.rollDirY = dy;
        } else {
          this.rollDirX = Math.cos(this.angle);
          this.rollDirY = Math.sin(this.angle);
        }

        this.vx = this.rollDirX * this.baseSpeed * this.rollSpeedMultiplier;
        this.vy = this.rollDirY * this.baseSpeed * this.rollSpeedMultiplier;
      } else {
      // Movement speed penalty while raising shield
      const speedMult = this.isBlocking ? 0.45 : 1.0;
      const targetVx = dx * this.baseSpeed * speedMult;
      const targetVy = dy * this.baseSpeed * speedMult;
      const accel = 18;

      this.vx += (targetVx - this.vx) * Math.min(1, accel * dt);
      this.vy += (targetVy - this.vy) * Math.min(1, accel * dt);
      }

      // Stamina Regeneration
      if (this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * dt);
      }
    }

    // 6. Update position with velocity & knockback
    this.x += (this.vx + this.knockbackVx) * dt;
    this.y += (this.vy + this.knockbackVy) * dt;

    // Decay knockback smoothly
    this.knockbackVx *= Math.pow(0.001, dt);
    this.knockbackVy *= Math.pow(0.001, dt);

    // 7. Constrain to room bounds
    const radius = this.radius;
    if (this.x - radius < bounds.minX) {
      this.x = bounds.minX + radius;
      this.vx = 0;
    }
    if (this.x + radius > bounds.maxX) {
      this.x = bounds.maxX - radius;
      this.vx = 0;
    }
    if (this.y - radius < bounds.minY) {
      this.y = bounds.minY + radius;
      this.vy = 0;
    }
    if (this.y + radius > bounds.maxY) {
      this.y = bounds.maxY - radius;
      this.vy = 0;
    }

    // 8. Decay after-image trails
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      this.afterImages[i].alpha -= dt * 2.5;
      if (this.afterImages[i].alpha <= 0) {
        this.afterImages.splice(i, 1);
      }
    }
  }

  syncHUD() {
    const hpFill = document.getElementById('hud-hp-fill');
    const hpText = document.getElementById('hud-hp-text');
    const staminaFill = document.getElementById('hud-stamina-fill');

    if (hpFill && hpText) {
      const hpPct = Math.max(0, Math.min(100, (this.hp / this.maxHp) * 100));
      hpFill.style.width = `${hpPct}%`;
      hpText.textContent = `${Math.ceil(this.hp)} / ${this.maxHp}`;
    }

    if (staminaFill) {
      const staminaPct = Math.max(0, Math.min(100, (this.stamina / this.maxStamina) * 100));
      staminaFill.style.width = `${staminaPct}%`;
    }
  }
}
