/**
 * Equipment & Item Catalog for Dungeon Slop
 * Defines 6 slots: helmet, chest, pants, boots, weapon, offhand (or 2-handed weapons occupying both hands).
 * All items feature procedural stats and distinct 2D shape rendering parameters.
 */

export const ItemRarity = {
  COMMON: { name: 'Common', color: '#94a3b8', border: '#475569' },
  RARE: { name: 'Rare', color: '#38bdf8', border: '#0284c7' },
  EPIC: { name: 'Epic', color: '#c084fc', border: '#9333ea' },
  LEGENDARY: { name: 'Legendary', color: '#fbbf24', border: '#d97706' }
};

export const ITEM_CATALOG = {
  // --- WEAPONS (1-HANDED & 2-HANDED) ---
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
    hands: 2, // TWO-HANDED: Occupies off-hand!
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
    hands: 2, // TWO-HANDED
    rarity: 'LEGENDARY',
    damage: 92,
    speed: 0.65,
    reach: 78,
    visual: 'warhammer_2h',
    desc: 'Heavy mythical maul that crushes targets with concussive shockwaves.'
  },

  // --- OFF-HAND ITEMS (Only equippable when 1-handed weapon is used) ---
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

  // --- HELMETS ---
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

  // --- CHEST PIECES ---
  'leather_tunic': {
    id: 'leather_tunic',
    name: 'Leather Tunic',
    slot: 'chest',
    rarity: 'COMMON',
    hp: 20,
    armor: 6,
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
    visual: 'celestial_chest',
    desc: 'Radiant gold breastplate that slowly mends wounds.'
  },

  // --- PANTS ---
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

  // --- BOOTS ---
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
