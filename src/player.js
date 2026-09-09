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

    // Weapon Attack Animation (Left Click)
    this.isAttacking = false;
    this.attackDuration = 0.22; // snappy, satisfying swing
    this.attackTimer = 0;
    this.attackProgress = 0; // 0 to 1

    // Offhand / Slap Animation (Right Click)
    this.isSlapping = false;
    this.slapDuration = 0.18;
    this.slapTimer = 0;
    this.slapProgress = 0; // 0 to 1

    // Equipment state placeholder
    this.equipment = {
      helmet: null,
      chest: null,
      pants: null,
      boots: null,
      weapon: { name: 'Iron Broadsword', type: '1h' },
      offhand: { name: 'Round Shield', type: 'shield' }
    };
  }

  triggerAttack() {
    this.isAttacking = true;
    this.attackTimer = this.attackDuration;
    this.attackProgress = 0;
  }

  triggerSlap() {
    this.isSlapping = true;
    this.slapTimer = this.slapDuration;
    this.slapProgress = 0;
  }

  update(dt, input, bounds = { minX: -580, minY: -580, maxX: 580, maxY: 580 }) {
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

    // 4. Roll / Dash state
    if (this.isRolling) {
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
        const targetVx = dx * this.baseSpeed;
        const targetVy = dy * this.baseSpeed;
        const accel = 18;

        this.vx += (targetVx - this.vx) * Math.min(1, accel * dt);
        this.vy += (targetVy - this.vy) * Math.min(1, accel * dt);
      }

      // Stamina Regeneration
      if (this.stamina < this.maxStamina) {
        this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * dt);
      }
    }

    // 6. Update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

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
