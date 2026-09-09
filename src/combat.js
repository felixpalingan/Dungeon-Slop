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
   * Triggers Active Ability (Q key).
   * Checks for completed Anime Set bonus first (which replaces Q with the Cinematic Ultimate),
   * otherwise falls back to the chest piece base Q ability.
   */
  triggerActiveAbility(player, setBonus = null, triggerCinematicCallback = null) {
    const now = performance.now() / 1000;
    const cooldownDuration = setBonus ? 8.0 : 5.0;

    // Cooldown check
    if (player.lastAbilityTime && now - player.lastAbilityTime < cooldownDuration) {
      const remaining = (cooldownDuration - (now - player.lastAbilityTime)).toFixed(1);
      this.particles.spawnComicText(player.x, player.y - 30, `COOLDOWN ${remaining}s`, '#94a3b8');
      return false;
    }

    player.lastAbilityTime = now;

    // --- 1. FULL SET CINEMATIC ULTIMATE Q ---
    if (setBonus && setBonus.ultimateQ) {
      if (setBonus.ultimateQ === 'hollow_purple') {
        // Gojo: Hollow Purple!
        this.audio.playHollowPurple();
        this.particles.spawnComicText(player.x, player.y - 36, 'HOLLOW PURPLE!', '#c084fc');
        if (triggerCinematicCallback) {
          triggerCinematicCallback('hollow_purple', player);
        }
        return true;
      } else if (setBonus.ultimateQ === 'world_cutting_slash') {
        // Sukuna: World Cutting Slash!
        this.audio.playWorldCuttingSlash();
        this.particles.spawnComicText(player.x, player.y - 36, 'WORLD CUTTING SLASH!', '#ff2a5f');
        if (triggerCinematicCallback) {
          triggerCinematicCallback('world_cutting_slash', player);
        }
        return true;
      } else if (setBonus.ultimateQ === 'inverted_chain_rampage') {
        // Toji: Thousand-Mile Chain Rampage!
        this.audio.playChainRampage();
        this.particles.spawnComicText(player.x, player.y - 36, 'CHAIN RAMPAGE!', '#38bdf8');
        if (triggerCinematicCallback) {
          triggerCinematicCallback('inverted_chain_rampage', player);
        }
        return true;
      } else if (setBonus.ultimateQ === 'berserker_rage') {
        // Guts: Berserker Beast Armor Unleashed!
        this.audio.playBerserkRoar();
        this.audio.playClang();
        this.particles.spawnComicText(player.x, player.y - 36, 'BERSERKER RAGE!', '#ef4444');
        if (triggerCinematicCallback) {
          triggerCinematicCallback('berserker_rage', player);
        }
        return true;
      }
    }

    // --- 2. BASE CHEST ACTIVE ABILITY ---
    const chest = player.equipment?.chest;
    if (!chest) return false;

    if (chest.baseQ === 'limitless_barrier' || chest.visual === 'gojo_tunic') {
      // Limitless Barrier: 3.5s repulsion force field & speed buff
      player.isInvulnerable = true;
      player.currentSpeed = player.baseSpeed * 1.45;
      this.particles.spawnComicText(player.x, player.y - 32, 'INFINITY BARRIER!', '#00f0ff');
      this.particles.spawnDashBurst(player.x, player.y, 0, '#00f0ff');
      this.audio.playSwing();
      setTimeout(() => {
        player.isInvulnerable = false;
        player.currentSpeed = player.baseSpeed;
      }, 3500);
    } else if (chest.baseQ === 'dismantle' || chest.visual === 'sukuna_robe') {
      // Dismantle: 3 rapid cursed razor slashes
      this.audio.playSwing();
      this.particles.spawnComicText(player.x, player.y - 32, 'DISMANTLE!', '#ff2a5f');
      if (triggerCinematicCallback) {
        triggerCinematicCallback('dismantle', player);
      }
    } else if (chest.baseQ === 'spartan_kick' || chest.visual === 'toji_shirt') {
      // Spartan Kick: Colossal forward lunge & knockback shockwave
      this.audio.playBonk();
      player.vx = Math.cos(player.angle) * 750;
      player.vy = Math.sin(player.angle) * 750;
      this.particles.spawnComicText(player.x, player.y - 32, 'SPARTAN KICK!', '#38bdf8');
      this.particles.spawnDashBurst(player.x, player.y, player.angle, '#38bdf8');
      if (triggerCinematicCallback) {
        triggerCinematicCallback('spartan_kick', player);
      }
    } else if (chest.baseQ === 'cannon_arm' || chest.visual === 'guts_berserker_plate') {
      // Guts Cannon Arm: Left arm prosthetic flips open firing explosive blast
      this.audio.playClang();
      this.particles.spawnComicText(player.x, player.y - 32, 'CANNON BLAST!', '#fbbf24');
      if (triggerCinematicCallback) {
        triggerCinematicCallback('cannon_arm', player);
      }
    } else if (chest.visual === 'celestial_chest') {
      // Celestial Radiance: Heal 35 HP + Shockwave
      player.hp = Math.min(player.maxHp, player.hp + 35);
      this.particles.spawnComicText(player.x, player.y - 32, 'CELESTIAL HEAL! +35', '#fbbf24');
      this.particles.spawnDashBurst(player.x, player.y, 0, '#fbbf24');
      this.audio.playDescentFanfare();
    } else if (chest.visual === 'steel_chest') {
      // Iron Bastion: 4-second hardened defense
      player.isHardened = true;
      setTimeout(() => (player.isHardened = false), 4000);
      this.particles.spawnComicText(player.x, player.y - 32, 'IRON BASTION!', '#38bdf8');
      this.audio.playBonk();
    } else {
      // War Cry
      this.particles.spawnComicText(player.x, player.y - 32, 'WAR CRY! +SPEED', '#ff3366');
      player.vx *= 1.5;
      player.vy *= 1.5;
      this.audio.playSwing();
    }

    return true;
  }
}
