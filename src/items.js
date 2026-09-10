/**
 * Equipment & Item Catalog for Dungeon Slop
 * Defines 6 slots: helmet, chest, pants, boots, weapon, offhand (or 2-handed weapons occupying both hands).
 * All items feature procedural stats and distinct 2D shape rendering parameters.
 */

export const ItemRarity = {
  COMMON: { name: 'Common', color: '#94a3b8', border: '#475569' },
  RARE: { name: 'Rare', color: '#38bdf8', border: '#0284c7' },
  EPIC: { name: 'Epic', color: '#c084fc', border: '#9333ea' },
  LEGENDARY: { name: 'Legendary', color: '#fbbf24', border: '#d97706' },
  MYTHIC: { name: 'Mythic', color: '#ff2a5f', border: '#e11d48' }
};

export const SET_DEFINITIONS = {
  'gojo': {
    name: 'The Honored One (Gojo Satoru)',
    anime: 'Jujutsu Kaisen',
    color: '#00f0ff',
    requiredItems: ['gojo_blindfold', 'gojo_tunic', 'gojo_slacks', 'gojo_loafers', 'lapse_blue', 'reversal_red'],
    ultimateQ: 'hollow_purple',
    desc: 'Combines Blue & Red into the screen-clearing Hollow Purple!'
  },
  'sukuna': {
    name: 'King of Curses (Ryomen Sukuna)',
    anime: 'Jujutsu Kaisen',
    color: '#ff2a5f',
    requiredItems: ['sukuna_crown', 'sukuna_robe', 'sukuna_hakama', 'sukuna_zori'],
    requiredWeaponOneOf: ['sukuna_kamutoke', 'sukuna_cleaver'],
    ultimateQ: 'world_cutting_slash',
    desc: 'Bisects reality with the unblockable World Cutting Slash!'
  },
  'toji': {
    name: 'Sorcerer Killer (Toji Fushiguro)',
    anime: 'Jujutsu Kaisen',
    color: '#38bdf8',
    requiredItems: ['toji_worm', 'toji_shirt', 'toji_pants', 'toji_slippers', 'inverted_spear_chain'],
    ultimateQ: 'inverted_chain_rampage',
    desc: 'Swings the Thousand-Mile Chain in a sweeping whirlwind that nullifies enemy shields!'
  },
  'guts': {
    name: 'The Black Swordsman (Guts)',
    anime: 'Berserk',
    color: '#ef4444',
    requiredItems: ['guts_beast_helm', 'guts_berserker_plate', 'guts_greaves', 'guts_sollerets', 'dragon_slayer'],
    ultimateQ: 'berserker_rage',
    desc: 'Unleashes the Berserker Beast Armor: +85% attack speed, immune to stun & knockback, +35% damage reduction, and 35% life steal!'
  }
};

/**
 * Checks if the player has all pieces of an anime set equipped.
 * Returns set bonus info or null.
 */
export function checkSetBonus(equipment) {
  if (!equipment) return null;

  for (const setKey in SET_DEFINITIONS) {
    const set = SET_DEFINITIONS[setKey];
    let isComplete = true;

    // Check all required items
    for (const itemId of set.requiredItems) {
      let hasItem = false;
      for (const slot in equipment) {
        if (equipment[slot]?.id === itemId) {
          hasItem = true;
          break;
        }
      }
      if (!hasItem) {
        isComplete = false;
        break;
      }
    }

    // Check weapon option if set permits alternate weapons (e.g. Sukuna)
    if (isComplete && set.requiredWeaponOneOf) {
      const currentWeaponId = equipment.weapon?.id;
      if (!set.requiredWeaponOneOf.includes(currentWeaponId)) {
        isComplete = false;
      }
    }

    if (isComplete) {
      return {
        setKey,
        name: set.name,
        anime: set.anime,
        color: set.color,
        ultimateQ: set.ultimateQ,
        desc: set.desc
      };
    }
  }

  return null;
}

export const ITEM_CATALOG = {
  // =========================================================================
  // BATCH 1: JUJUTSU KAISEN & BERSERK
  // =========================================================================

  // --- GOJO SATORU SET ---
  'gojo_blindfold': {
    id: 'gojo_blindfold',
    name: 'Blindfold of the Six Eyes',
    set: 'gojo',
    slot: 'helmet',
    rarity: 'MYTHIC',
    hp: 35,
    armor: 6,
    cooldownReduction: 0.2,
    visual: 'gojo_blindfold',
    desc: 'Pure pitch-black blindfold. The Six Eyes perceive cursed energy with 100% precision.'
  },
  'gojo_tunic': {
    id: 'gojo_tunic',
    name: 'High-Collar Jujutsu Tunic',
    set: 'gojo',
    slot: 'chest',
    rarity: 'MYTHIC',
    hp: 55,
    armor: 15,
    baseQ: 'limitless_barrier',
    visual: 'gojo_tunic',
    desc: 'Midnight high-collar uniform. Base Q: Limitless Barrier slows nearby foes and deflects projectiles.'
  },
  'gojo_slacks': {
    id: 'gojo_slacks',
    name: 'Sorcerer Black Slacks',
    set: 'gojo',
    slot: 'pants',
    rarity: 'LEGENDARY',
    hp: 25,
    armor: 8,
    speedBonus: 22,
    visual: 'gojo_slacks',
    desc: 'Tailored black dress trousers tailored for maximum agility.'
  },
  'gojo_loafers': {
    id: 'gojo_loafers',
    name: 'Polished Black Loafers',
    set: 'gojo',
    slot: 'boots',
    rarity: 'LEGENDARY',
    speedBonus: 30,
    rollCostReduction: 12,
    visual: 'gojo_loafers',
    desc: 'Pristine dress shoes. Dash rolls consume 35% less stamina.'
  },
  'lapse_blue': {
    id: 'lapse_blue',
    name: 'Cursed Technique: Lapse Blue',
    set: 'gojo',
    slot: 'weapon',
    hands: 1,
    rarity: 'MYTHIC',
    damage: 42,
    speed: 1.15,
    reach: 65,
    visual: 'lapse_blue',
    desc: 'Floating azure vortex. Left-click attacks generate gravitational pull on enemies.'
  },
  'reversal_red': {
    id: 'reversal_red',
    name: 'Cursed Technique: Reversal Red',
    set: 'gojo',
    slot: 'offhand',
    rarity: 'MYTHIC',
    damageBuff: 18,
    armor: 10,
    visual: 'reversal_red',
    desc: 'Floating crimson sphere of positive energy. Detonates explosive knockback on impact.'
  },

  // --- RYOMEN SUKUNA SET ---
  'sukuna_crown': {
    id: 'sukuna_crown',
    name: 'Crown of the Disgraced One',
    set: 'sukuna',
    slot: 'helmet',
    rarity: 'MYTHIC',
    hp: 30,
    critChance: 0.25,
    visual: 'sukuna_crown',
    desc: 'Sprouts four glowing scarlet eyes across the forehead with +25% critical strike chance.'
  },
  'sukuna_robe': {
    id: 'sukuna_robe',
    name: 'Robe of Malevolence',
    set: 'sukuna',
    slot: 'chest',
    rarity: 'MYTHIC',
    hp: 50,
    armor: 18,
    baseQ: 'dismantle',
    visual: 'sukuna_robe',
    desc: 'White flowing kimono with cursed black markings. Base Q: Dismantle fires 3 razor wind blades.'
  },
  'sukuna_hakama': {
    id: 'sukuna_hakama',
    name: 'Baggy Hakama Trousers',
    set: 'sukuna',
    slot: 'pants',
    rarity: 'LEGENDARY',
    hp: 30,
    armor: 12,
    staminaRegen: 10,
    visual: 'sukuna_hakama',
    desc: 'Traditional martial trousers granting immense stamina flow.'
  },
  'sukuna_zori': {
    id: 'sukuna_zori',
    name: 'Cursed Straw Zori',
    set: 'sukuna',
    slot: 'boots',
    rarity: 'LEGENDARY',
    speedBonus: 28,
    visual: 'sukuna_zori',
    desc: 'Cursed woven sandals granting fluid repositioning.'
  },
  'sukuna_kamutoke': {
    id: 'sukuna_kamutoke',
    name: 'Kamutoke Vajra Dagger',
    set: 'sukuna',
    slot: 'weapon',
    hands: 1,
    rarity: 'MYTHIC',
    damage: 48,
    speed: 1.35,
    reach: 60,
    visual: 'sukuna_kamutoke',
    desc: 'Mythical thunder dagger. Stabs with lightning sparks that arc into nearby targets.'
  },
  'sukuna_hiten': {
    id: 'sukuna_hiten',
    name: 'Hiten Cursed Spear',
    set: 'sukuna',
    slot: 'offhand',
    rarity: 'MYTHIC',
    armor: 12,
    damageBuff: 15,
    visual: 'sukuna_hiten',
    desc: 'Cursed fire trident. Right-click lunges with scorching fire thrusts.'
  },
  'sukuna_cleaver': {
    id: 'sukuna_cleaver',
    name: 'Malevolent Cleaver',
    set: 'sukuna',
    slot: 'weapon',
    hands: 2,
    rarity: 'MYTHIC',
    damage: 88,
    speed: 0.85,
    reach: 82,
    visual: 'sukuna_cleaver',
    desc: 'Heavy two-handed butcher blade infused with endless slicing cursed energy.'
  },

  // --- TOJI FUSHIGURO SET ---
  'toji_worm': {
    id: 'toji_worm',
    name: 'Coiled Inventory Curse',
    set: 'toji',
    slot: 'helmet',
    rarity: 'EPIC',
    hp: 20,
    armor: 8,
    visual: 'toji_worm',
    desc: 'Gross centipede-like curse draped over the shoulders. Stores weapons and ammunition.'
  },
  'toji_shirt': {
    id: 'toji_shirt',
    name: 'Compression Combat Shirt',
    set: 'toji',
    slot: 'chest',
    rarity: 'EPIC',
    hp: 45,
    armor: 14,
    baseQ: 'spartan_kick',
    visual: 'toji_shirt',
    desc: 'Tight black athletic shirt. Base Q: Spartan Kick launches foes backwards with massive knockback.'
  },
  'toji_pants': {
    id: 'toji_pants',
    name: 'Baggy Gi Training Pants',
    set: 'toji',
    slot: 'pants',
    rarity: 'EPIC',
    hp: 25,
    armor: 10,
    staminaRegen: 12,
    visual: 'toji_pants',
    desc: 'Comfortable martial arts trousers providing swift footwork.'
  },
  'toji_slippers': {
    id: 'toji_slippers',
    name: 'Heavenly Restriction Slippers',
    set: 'toji',
    slot: 'boots',
    rarity: 'EPIC',
    speedBonus: 35,
    visual: 'toji_slippers',
    desc: 'Completely silent footsteps. Sprint speed increased by +35.'
  },
  'inverted_spear_chain': {
    id: 'inverted_spear_chain',
    name: 'Inverted Spear of Heaven & Thousand-Mile Chain',
    set: 'toji',
    slot: 'weapon',
    hands: 2, // TWO-HANDED: Occupies both hands!
    rarity: 'MYTHIC',
    damage: 75,
    speed: 0.95,
    reach: 85,
    visual: 'inverted_spear_chain',
    desc: 'Two-handed special grade cursed weapon. Thrusts nullify enemy shields; Right-click swings chain 360°.'
  },

  // --- GUTS (BERSERK) SET ---
  'guts_beast_helm': {
    id: 'guts_beast_helm',
    name: 'Berserker Beast Helm',
    set: 'guts',
    slot: 'helmet',
    rarity: 'MYTHIC',
    hp: 40,
    armor: 16,
    critChance: 0.18,
    visual: 'guts_beast_helm',
    desc: 'Canine demonic visage. Glowing scarlet eyes pierce through the darkness.'
  },
  'guts_berserker_plate': {
    id: 'guts_berserker_plate',
    name: 'Berserker Armor Plate',
    set: 'guts',
    slot: 'chest',
    rarity: 'MYTHIC',
    hp: 85,
    armor: 28,
    baseQ: 'cannon_arm',
    visual: 'guts_berserker_plate',
    desc: 'Jagged cursed iron plate. Base Q: Cannon Arm pivots open left arm, firing an explosive shell.'
  },
  'guts_greaves': {
    id: 'guts_greaves',
    name: 'Black Iron Greaves',
    set: 'guts',
    slot: 'pants',
    rarity: 'LEGENDARY',
    hp: 35,
    armor: 18,
    visual: 'guts_greaves',
    desc: 'Reinforced black iron leg plates granting knockback resistance.'
  },
  'guts_sollerets': {
    id: 'guts_sollerets',
    name: 'Heavy War Sollerets',
    set: 'guts',
    slot: 'boots',
    rarity: 'LEGENDARY',
    speedBonus: 15,
    armor: 12,
    visual: 'guts_sollerets',
    desc: 'Heavy steel treads immune to ground spikes and traps.'
  },
  'dragon_slayer': {
    id: 'dragon_slayer',
    name: 'Dragon Slayer',
    set: 'guts',
    slot: 'weapon',
    hands: 2, // TWO-HANDED
    rarity: 'MYTHIC',
    damage: 105,
    speed: 0.65,
    reach: 92,
    visual: 'dragon_slayer',
    desc: 'It was much too big to be called a sword. Massive cleave arc that pulverizes multiple targets.'
  },

  // =========================================================================
  // BASELINE STARTER / DUNGEON GEAR
  // =========================================================================
  'rusty_sword': {
    id: 'rusty_sword',
    name: 'Rusty Shortsword',
    slot: 'weapon',
    hands: 1,
    rarity: 'COMMON',
    damage: 22,
    speed: 1.0,
    reach: 58,
    visual: 'sword_1h',
    desc: 'An old reliable iron blade. Swift slashes.'
  },
  'crystal_blade': {
    id: 'crystal_blade',
    name: 'Crystal Scimitar',
    slot: 'weapon',
    hands: 1,
    rarity: 'RARE',
    damage: 34,
    speed: 1.25,
    reach: 64,
    visual: 'crystal_blade',
    desc: 'Lightweight forged prism blade with swift attack speed.'
  },
  'titan_greatsword': {
    id: 'titan_greatsword',
    name: 'Titan Greatsword',
    slot: 'weapon',
    hands: 2,
    rarity: 'EPIC',
    damage: 68,
    speed: 0.72,
    reach: 84,
    visual: 'greatsword_2h',
    desc: 'Colossal two-handed broadsword with massive sweeping cleave arc.'
  },
  'thunder_warhammer': {
    id: 'thunder_warhammer',
    name: 'Thunder Warhammer',
    slot: 'weapon',
    hands: 2,
    rarity: 'LEGENDARY',
    damage: 92,
    speed: 0.65,
    reach: 78,
    visual: 'warhammer_2h',
    desc: 'Heavy mythical maul that crushes targets with concussive shockwaves.'
  },
  'wooden_buckler': {
    id: 'wooden_buckler',
    name: 'Wooden Buckler',
    slot: 'offhand',
    rarity: 'COMMON',
    armor: 5,
    blockMitigation: 0.5,
    visual: 'buckler',
    desc: 'Simple oak shield. Right-click to deflect incoming strikes.'
  },
  'iron_tower_shield': {
    id: 'iron_tower_shield',
    name: 'Iron Tower Shield',
    slot: 'offhand',
    rarity: 'RARE',
    armor: 14,
    blockMitigation: 0.85,
    visual: 'tower_shield',
    desc: 'Reinforced heavy steel pavise. Blocks 85% of front damage.'
  },
  'arcane_tome': {
    id: 'arcane_tome',
    name: 'Arcane Grimoire',
    slot: 'offhand',
    rarity: 'EPIC',
    armor: 2,
    cooldownReduction: 0.2,
    damageBuff: 12,
    visual: 'tome',
    desc: 'Ancient spellbook humming with runic energy. Boosts ability speed.'
  },
  'iron_visor': {
    id: 'iron_visor',
    name: 'Iron Visor Helm',
    slot: 'helmet',
    rarity: 'COMMON',
    hp: 15,
    armor: 4,
    visual: 'visor_helm',
    desc: 'Basic iron headpiece with narrow eye slit.'
  },
  'horned_barbarian_helm': {
    id: 'horned_barbarian_helm',
    name: 'Horned War Helm',
    slot: 'helmet',
    rarity: 'RARE',
    hp: 30,
    armor: 8,
    visual: 'horned_helm',
    desc: 'Fierce bull horns that increase melee knockback on enemies.'
  },
  'shadow_hood': {
    id: 'shadow_hood',
    name: 'Shadow Cowl',
    slot: 'helmet',
    rarity: 'EPIC',
    hp: 20,
    critChance: 0.15,
    visual: 'cowl_hood',
    desc: 'Dark cowl imbued with rogue instincts. +15% Critical strike chance.'
  },
  'leather_tunic': {
    id: 'leather_tunic',
    name: 'Leather Tunic',
    slot: 'chest',
    rarity: 'COMMON',
    hp: 20,
    armor: 6,
    baseQ: 'war_cry',
    visual: 'leather_chest',
    desc: 'Supple stitched leather vest.'
  },
  'spiked_cuirass': {
    id: 'spiked_cuirass',
    name: 'Spiked Steel Cuirass',
    slot: 'chest',
    rarity: 'RARE',
    hp: 45,
    armor: 16,
    baseQ: 'iron_bastion',
    visual: 'steel_chest',
    desc: 'Thick steel breastplate lined with defensive spikes.'
  },
  'celestial_mantle': {
    id: 'celestial_mantle',
    name: 'Celestial Mantle',
    slot: 'chest',
    rarity: 'LEGENDARY',
    hp: 75,
    armor: 24,
    healthRegen: 3,
    baseQ: 'celestial_heal',
    visual: 'celestial_chest',
    desc: 'Radiant gold breastplate that slowly mends wounds.'
  },
  'cloth_pants': {
    id: 'cloth_pants',
    name: 'Padded Leggings',
    slot: 'pants',
    rarity: 'COMMON',
    hp: 10,
    staminaRegen: 4,
    visual: 'cloth_pants',
    desc: 'Flexible travel pants.'
  },
  'plated_greaves': {
    id: 'plated_greaves',
    name: 'Heavy Plate Greaves',
    slot: 'pants',
    rarity: 'RARE',
    hp: 25,
    armor: 10,
    staminaRegen: 8,
    visual: 'plate_greaves',
    desc: 'Articulated knee guards providing solid lower armor.'
  },
  'travel_boots': {
    id: 'travel_boots',
    name: 'Worn Leather Boots',
    slot: 'boots',
    rarity: 'COMMON',
    speedBonus: 15,
    visual: 'leather_boots',
    desc: 'Lightweight hiking boots.'
  },
  'wind_striders': {
    id: 'wind_striders',
    name: 'Wind Striders',
    slot: 'boots',
    rarity: 'RARE',
    speedBonus: 35,
    rollCostReduction: 10,
    visual: 'winged_boots',
    desc: 'Winged boots allowing swift sprint speeds and cheaper dodge rolls.'
  }
};
