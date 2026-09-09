# Anime Equipment & Armor Sets Roster

This document specifies the complete anime gear system for **Dungeon Slop**, including damage scaling, defensive stats, procedural 2D shape rendering, unique attack animations, Web Audio sound design, and **full-screen cinematic ultimate `Q` animations**.

---

## Combat & Damage Balancing Reference (Base Stats)

| Metric | Baseline Value | High / 2H Value | Ultimate Value |
| :--- | :--- | :--- | :--- |
| **Player HP** | 100 HP | Up to 220 HP (with full set) | — |
| **1-Handed Weapon Damage** | 25 – 45 dmg | — | — |
| **2-Handed Weapon Damage** | 65 – 110 dmg | Heavy crushing cleave | — |
| **Attack Speed** | 0.20s – 0.35s per swing | 0.50s – 0.70s per swing | — |
| **Base Q Ability Damage** | 30 – 50 dmg | Moderate utility / defense | — |
| **Full Set Ultimate Q Damage**| **150 – 350+ True Damage** | Screen-wide AOE & CC | 15s – 25s Cooldown |

---

## Batch 1: Jujutsu Kaisen & Berserk `[IMPLEMENTED & PLAYABLE]`

### 1. Gojo Satoru — *The Honored One*
*Aesthetic: Midnight high-collar tunic, floating Azure/Crimson energy orbs, glowing cyan blindfold visor.*
- **Helmet**: `Blindfold of the Six Eyes` (+35 Max HP, -20% Ability Cooldowns, glowing cyan visor)
- **Chest**: `High-Collar Jujutsu Tunic` (+55 HP, +15 Armor)
  - *Base Q Ability*: **Limitless Barrier (無下限呪術)** — Creates a pulsing blue spatial repulsion field around Gojo for 3.5s that grants invulnerability and +45% movement speed. (Cooldown: 5s).
- **Pants**: `Sorcerer Black Slacks` (+25 HP, +8 Armor, +22 Movement Speed)
- **Boots**: `Polished Black Loafers` (+30 Speed, -12 Stamina Dash Cost)
- **Weapon (1H)**: `Cursed Technique: Lapse Blue (蒼)` — Floating azure orb. Left-click fires a swirling blue gravity pulse (42 dmg) with inward suction streaks and 3 concentric expanding shockwave rings.
- **Off-Hand**: `Cursed Technique: Reversal Red (赫)` — Floating crimson orb (+18 dmg, +10 Armor). Right-click detonates an explosive repulsion blast with expanding red shockwaves and heavy knockback.
- 🔮 **FULL SET BONUS: Hollow Purple (虚式「茈」)**:
  - Replaces `Q` with the iconic **Hollow Purple**!
  - **Full-Screen Cinematic Animation**:
    - Screen darkens into a deep violet/purple vortex vignette.
    - Launches a massive 160px expanding glowing purple sphere along player aim angle dealing **320 True Damage** with heavy screen shake.
  - **Sound Design**: Deep sub-bass resonance rumble followed by a piercing harmonic shockwave.

---

### 2. Ryomen Sukuna — *King of Curses*
*Aesthetic: Pure white flowing kimono, four glowing crimson forehead eyes, sharp cursed markings.*
- **Helmet**: `Crown of the Disgraced One` (+30 HP, +25% Critical Strike Chance, 4 glowing red forehead eyes)
- **Chest**: `Robe of Malevolence` (+50 HP, +18 Armor)
  - *Base Q Ability*: **Dismantle (解)** — Fires 3 rapid cursed razor wind slashes in a spread cone (75 dmg each). (Cooldown: 5s).
- **Pants**: `Baggy Hakama Trousers` (+30 HP, +12 Armor, +10 Stamina Regen)
- **Boots**: `Cursed Straw Zori` (+28 Movement Speed)
- **Weapon Options**:
  - `Kamutoke Vajra Dagger (1H)` (48 dmg, 1.35 speed): Rapid triple-stabbing flurries with golden-yellow and crimson branching lightning bolts arcing from the tip.
  - `Malevolent Cleaver (2H)` (88 dmg, 0.85 speed): Heavy diagonal butcher blade down-cleave with a deep blood-red crescent arc, razor edge, and intersecting X dismantle cuts.
- **Off-Hand**: `Hiten Cursed Spear` (Thrusting flame spear, +15 dmg buff, +12 Armor; Right-click thrusts fiery spear with flaming embers).
- 💀 **FULL SET BONUS: World Cutting Slash (世界を断つ斬撃)**:
  - Replaces `Q` with the **World Cutting Slash**!
  - **Full-Screen Cinematic Animation**:
    - Reality freezes and turns monochrome gray for 0.35s.
    - A razor-sharp diagonal red-black dimensional cut line slices across the **entire length of the screen**, visibly shifting/offsetting the canvas halves.
    - Deals **350 True Damage** to everything caught along the path with heavy screen shake.
  - **Sound Design**: High-frequency silence-to-slash audio snap.

---

### 3. Toji Fushiguro — *Sorcerer Killer*
*Aesthetic: Muscle compression shirt, inventory curse coiled around neck, swinging heavy chain.*
- **Helmet**: `Coiled Inventory Curse` (+20 HP, +8 Armor, coiled serpent worm on shoulder)
- **Chest**: `Compression Combat Shirt` (+45 HP, +14 Armor)
  - *Base Q Ability*: **Spartan Kick** — Devastating front lunge kick sending player and targets flying forward with massive knockback. (Cooldown: 5s).
- **Pants**: `Baggy Gi Training Pants` (+25 HP, +10 Armor, +12 Stamina Regen)
- **Boots**: `Heavenly Restriction Slippers` (+35 Sprint Speed, silent footsteps)
- **Weapon (2H)**: **Inverted Spear of Heaven & Thousand-Mile Chain**!
  - Occupies both weapon and off-hand slots.
  - **Attack Animation**:
    - Left Click: Long-range piercing thrust with the two-pronged Inverted Spear (75 dmg), uncoiling a trailing chain and disabling enemy shields.
    - Right Click: Spins chain in wide sweeping arcs.
  - **Full Set Bonus Q**: **Thousand-Mile Chain Rampage**:
    - 360-degree high-velocity iron chain storm shredding surrounding enemies.
  - **Sound Design**: Heavy rattling iron chain links + sharp piercing metallic jitte thrust.

---

### 4. Guts — *The Black Swordsman*
*Aesthetic: Pitch black jagged plate armor, canine beast helmet, colossal iron slab.*
- **Helmet**: `Berserker Beast Helm` (+40 HP, +16 Armor, +18% Crit Chance; jagged demonic jaw with glowing crimson eye slits)
- **Chest**: `Berserker Armor Plate` (+85 HP, +28 Armor)
  - *Base Q Ability*: **Cannon Arm** — Prosthetic left arm pivots forward, firing an explosive artillery blast (130 dmg AOE) with heavy recoil smoke. (Cooldown: 5s).
- **Pants**: `Black Iron Greaves` (+35 HP, +18 Armor, knockback immunity)
- **Boots**: `Heavy War Sollerets` (+15 Speed, +12 Armor, immune to ground traps)
- **Weapon (2H)**: **Dragon Slayer**!
  - Colossal 92px black iron slab (105 dmg, 0.65 speed).
  - **Attack Animation**: Massive two-handed 180° overhead down-cleave with a 12px thick black iron arc, 24px glowing crimson edge, and flying red-hot friction sparks.
- 🩸 **FULL SET BONUS: Berserker Beast Armor Unleashed (狂戦士の甲冑)**:
  - Replaces `Q` with **Berserker Rage**!
  - **Full-Screen Cinematic Animation**:
    - Dark red blood-aura veins pulse across the entire screen border.
    - **Total Invulnerability**: Ignores 100% of damage for 6.0 seconds!
    - Movement speed +50%, attacks trigger violent screen shakes, blood sparks, and a thunderous metal comic `CLANG!` popup!
  - **Sound Design**: Demonic beast roar + resounding anvil `CLANG!` hits.

---

## Batch 2: Attack on Titan, Cyberpunk & One Punch Man `[UPCOMING]`

### 5. Levi Ackerman — *Survey Corps (ODM Gear)*
*Aesthetic: Green Scout cloak with Wings of Freedom, waist gas canisters, dual snap blades.*
- **Helmet**: `Survey Corps Hooded Cloak`
- **Chest**: `3D Maneuver Harness & Gas Cannisters`
  - *Base Q Ability*: **Gas Boost** — Rapid omni-directional gas burst.
- **Pants**: `White Cavalry Trousers`
- **Boots**: `Tall Leather Riding Boots`
- **Weapon (1H)**: `Ultrahard Steel Snap Blade` (35 dmg, fast stabs)
- **Off-Hand**: `Secondary Steel Blade & Wire Trigger`
- ⚔️ **FULL SET BONUS: Omni-Directional Mobility (Levi Spiral)**:
  - **Controls Overhaul per User Feedback**:
    - Clicking launches a **single high-tension grapple cable** towards the cursor, latching onto walls, pillars, or enemies!
    - Instantly pulls Levi with hyper-acceleration along an unrestrained trajectory.
    - While grappling, Levi spins in a lethal 360° blade whirlwind, dealing **80 dmg per tick** to every enemy collided with along the flight path, accompanied by comic `SLASH!` and `WHIRLWIND!` text!
  - **Sound Design**: High-pressure pneumatic gas hiss (`PSSSSHH!`) + high-speed steel blade slice.

---

### 6. David Martinez — *Night City Legend*
*Aesthetic: Fluorescent yellow EMT jacket, spinal Sandevistan chassis, chrome cyber-sneakers.*
- **Helmet**: `Kiroshi Optics Mk. 4` (+20% Crit Chance, reveals enemy health meters)
- **Chest**: `Gloria's High-Vis EMT Jacket` (+30 HP, +10 Armor)
  - *Base Q Ability*: **Overcharge Boost** — +25% sprint speed for 3s.
- **Pants**: `Streetkid Cargo Pants`
- **Boots**: `Chrome Cyber-Sneakers`
- **Weapon (1H)**: `Carnage Shotgun` (Fires a cone of 6 buckshot pellets, 12 dmg each)
- **Off-Hand**: `Gorilla Arms` (Heavy hydraulic punch, 45 dmg)
- ⚡ **FULL SET BONUS: Military-Grade Sandevistan**:
  - Replaces `Q` with **Sandevistan Time Dilation**!
  - **Mechanics per User Feedback**:
    - **Global Slow-Mo**: Time slows down to **10% speed for EVERYONE ELSE** (all monsters, projectiles, AND other players/friends on the map)!
    - **David is the ONLY ONE moving at full normal speed** for 4 seconds!
    - Screen is covered in a retro cyberpunk green matrix grid and chromatic aberration. David leaves persistent cyan and lime after-image ghost trails as he maneuvers freely and decimates frozen enemies.
  - **Sound Design**: Iconic high-pitch Sandevistan digital boot-up chirp (`BWEEEEE-SHOOOM`) -> ticking slow-mo clock bassline.

---

### 7. Saitama — *The Caped Baldy*
*Aesthetic: Bright yellow jumpsuit, white fluttering cape, red rubber gloves & boots.*
- **Helmet**: `Hero's Polished Bald Scalp` (+50 Armor, reflective shine)
- **Chest**: `Yellow Hero Suit & Cape` (+100 HP, +25 Armor)
  - *Base Q Ability*: **Consecutive Normal Punches** — Flurry of 8 rapid jabs (8 x 14 dmg).
- **Pants**: `Yellow Hero Tights`
- **Boots**: `Red Rubber Hero Boots` (+20 Speed)
- **Weapon (1H)**: `Red Hero Glove` (Heavy punch, 50 dmg)
- **Off-Hand**: `Supermarket Bargain Grocery Bag` (Right-click bag slap drops leek particles and deals 20 dmg)
- 💥 **FULL SET BONUS: Serious Punch (マジ殴り)**:
  - Replaces `Q` with **Serious Punch**!
  - **Full-Screen Cinematic Animation**:
    - Screen turns stark black and white with high-contrast manga line shading.
    - Camera pulls back as Saitama cocks his right fist; air currents swirl inward.
    - Unleashes a titanic conical shockwave that tears across the entire screen, disintegrating every enemy caught in the blast for **350 True Damage** with a massive comic banner: `SERIOUS PUNCH!`!
  - **Sound Design**: Deep vacuum whoosh -> deafening atmospheric boom.

---

## Batch 3: Fire Force, Tensura, Death Note & Re:Zero `[UPCOMING]`

### 8. Shinra Kusakabe — *Company 8 (Devil's Footprints)*
- Set items: Fire Brigade Visor, Bunker Coat, Turnout Pants, **Devil's Ignition Boots**, Flame Claws, Shield.
- **Full Set Bonus Q**: **Adolla Flight & Light-Speed Kick** — Rockets across the screen leaving fiery canvas trails, ending in a massive orange-black Adolla explosion.

### 9. Arthur Boyle — *Knight King*
- Set items: Knight's Circlet, White Surcoat, Paladin Breeches, Sabatons, **Excalibur (Plasma Blade)**, Plasma Buckler.
- **Full Set Bonus Q**: **Violet Flash: Earth Divider** — Arthur extends Excalibur into a screen-spanning purple plasma blade, severing everything in a horizontal cleave.

### 10. Rimuru Tempest — *True Demon Lord*
- Set items: Shizu's Anti-Magic Mask, Demon Lord Coat, Silk Trousers, High Boots, **Demon Katana**, Water Orb.
- **Full Set Bonus Q**: **Beelzebuth (Gluttony)** — Spawns a swirling black hole vortex that vacuums in all nearby enemies and projectiles, devouring them and healing Rimuru.

### 11. Light Yagami — *Kira*
- Set items: Kira's Smirk & Glasses, School Blazer, Uniform Slacks, Dress Shoes, Quill Pen, **The Death Note**.
- **Full Set Bonus Q**: **Heart Attack Judgment (40 Seconds)** — Places a floating skull countdown over target; after 3 seconds, a lightning strike inflicts catastrophic true damage with `DELETE!`.

### 12. Subaru Natsuki — *Return by Death*
- Set items: Emilia Insignia, **Legendary Tracksuit**, Sweatpants, Sneakers, Guiltywhip, Mana Stone.
- **Full Set Bonus**: **Return by Death** passive rewind upon death + active **Cor Leonis** linking party members with health-sharing tether beams.

### 13. Rem — *Oni Maid*
- Set items: Maid Ribbon & Horn, Frilled Apron, Petticoat, Mary-Janes, **Spiked Morningstar Flail (2H)**.
- **Full Set Bonus Q**: **Oni Rampage** — Spawns white glowing oni horn, granting +100% attack speed, increased morningstar chain reach, and 20% life steal.
