/**
 * Combat System for Dungeon Slop
 * Handles weapon-specific hitboxes, cleave arcs, critical hits,
 * shield block mitigation, and active chest abilities (Q key).
 */

export class CombatSystem {
  constructor(audio, particles) {
    this.audio = audio;
    this.particles = particles;
  }

  /**
   * Executes a weapon attack for an attacker entity.
   * Checks for targets within weapon reach and cleave arc.
   */
  performWeaponAttack(attacker, targets = []) {
    const weapon = attacker.equipment?.weapon || {
      name: 'Unarmed Fists',
      damage: 10,
      reach: 48,
      speed: 1.0,
      hands: 1
    };

    const reach = weapon.reach || 55;
    const arcHalfAngle = weapon.hands === 2 ? Math.PI * 0.48 : Math.PI * 0.35; // 2H weapons have wide sweeping cleave!
    const baseDamage = weapon.damage || 15;

    let hits = [];

    for (const target of targets) {
      if (!target || target === attacker) continue;

      const dx = target.x - attacker.x;
      const dy = target.y - attacker.y;
      const dist = Math.hypot(dx, dy);

      // Check distance against target radius + weapon reach
      if (dist <= reach + (target.radius || 20)) {
        // Check angle within attack cone facing mouse/angle
        const angleToTarget = Math.atan2(dy, dx);
        let angleDiff = angleToTarget - attacker.angle;

        // Normalize angle difference to [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) <= arcHalfAngle) {
          // Check Critical Strike chance
          const isCrit = Math.random() < (attacker.equipment?.helmet?.critChance || 0.08);
          const finalDamage = Math.round(baseDamage * (isCrit ? 1.85 : (0.9 + Math.random() * 0.2)));

          // Check if target is actively blocking with a shield
          const isBlocked = target.isBlocking && Math.abs(angleDiff) > Math.PI * 0.5; // facing opposite
          const damageTaken = isBlocked
            ? Math.round(finalDamage * (1 - (target.equipment?.offhand?.blockMitigation || 0.6)))
            : finalDamage;

          hits.push({
            target,
            damage: damageTaken,
            isCrit,
            isBlocked,
            angle: attacker.angle,
            knockback: weapon.hands === 2 ? 500 : 320
          });
        }
      }
    }

    return hits;
  }

  /**
   * Triggers Chest Piece Active Ability (Q key)
   */
  triggerChestAbility(player) {
    const chest = player.equipment?.chest;
    if (!chest) return false;

    // Cooldown check
    const now = performance.now() / 1000;
    if (player.lastAbilityTime && now - player.lastAbilityTime < 6.0) {
      this.particles.spawnComicText(player.x, player.y - 30, 'COOLDOWN!', '#94a3b8');
      return false;
    }

    player.lastAbilityTime = now;

    if (chest.visual === 'celestial_chest') {
      // Celestial Radiance: Heal 35 HP + Shockwave
      player.hp = Math.min(player.maxHp, player.hp + 35);
      this.particles.spawnComicText(player.x, player.y - 32, 'CELESTIAL HEAL! +35', '#fbbf24');
      this.particles.spawnDashBurst(player.x, player.y, 0, '#fbbf24');
      this.audio.playDescentFanfare();
    } else if (chest.visual === 'steel_chest') {
      // Iron Bastion: 4-second hardened defense + Shield burst
      player.isHardened = true;
      setTimeout(() => (player.isHardened = false), 4000);
      this.particles.spawnComicText(player.x, player.y - 32, 'IRON BASTION!', '#38bdf8');
      this.audio.playBonk();
    } else {
      // Battle Cry / War Shout
      this.particles.spawnComicText(player.x, player.y - 32, 'WAR CRY! +SPEED', '#ff3366');
      player.vx *= 1.5;
      player.vy *= 1.5;
      this.audio.playSwing();
    }

    return true;
  }
}
