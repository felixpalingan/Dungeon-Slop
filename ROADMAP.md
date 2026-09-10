# Dungeon Slop — Development Roadmap & Implementation Plan

A 1 to 6 player cooperative top-down dungeon crawler designed for chaotic friend-group fun. Delve as deep into procedural dungeon floors as possible!

All visuals are **100% procedural 2D shapes** (zero sprite art needed), networking runs serverlessly via **WebRTC (PeerJS)** with room codes, and the game features a full 6-slot gear system, shared ground loot trading, downed/revive mechanics, slap physics, comic popup sound effects, and full-screen cinematic anime ultimates.

---

## Phased Development Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Dungeon Slop Phase Gates                        │
├────────────────────────────────────────────────────────────────────────┤
│  Phase 1: Foundation, Procedural 2D Character & Movement [DONE]        │
│      ▼                                                                 │
│  Phase 2: WebRTC Multiplayer, In-World Wardrobe & Slap Physics [DONE]  │
│      ▼                                                                 │
│  Phase 3: Equipment System, Ground Loot Trading & Anime Gear Batches   │
│    ├── Step 3.1: 6-Slot Gear Catalog & Procedural Visuals [DONE]       │
│    ├── Step 3.2: Real-Time Combat & Shield Blocking [DONE]             │
│    ├── Step 3.3: Ground Loot Entities & Inventory UI [DONE]            │
│    ├── Step 3.4: Anime Batch 1 (Jujutsu Kaisen & Berserk) [DONE]       │
│    │     • 3.4.1: Items Catalog (Gojo, Sukuna, Toji, Guts) [DONE]      │
│    │     • 3.4.2: Procedural 2D Visual Rendering [DONE]                │
│    │     • 3.4.3: Weapon Attacks & Full-Screen Cinematic Q [DONE]      │
│    │     • 3.4.4: Bespoke Web Audio Synthesizers [DONE]                │
│    ├── Step 3.5: Anime Batch 2 (Attack on Titan, Cyberpunk & OPM)      │
│    └── Step 3.6: Anime Batch 3 (Fire Force, Tensura, Death Note, ReZero)│
│      ▼                                                                 │
│  Phase 4: Procedural Dungeon Generation, Monster AI & Floor Descent    │
│      ▼                                                                 │
│  Phase 5: Downed / Revive Clutch System, Polish & Public-Ready Build   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Phases & Progress

### Phase 1: Foundation, Procedural 2D Character & Movement `[COMPLETED]`
- Canvas setup, viewport resize listeners, high-DPI rendering.
- Vector circle character with directional aim facing mouse cursor.
- WASD directional movement with normalized diagonals.
- Left Shift Dodge Roll with after-image ghost trails and stamina gauge.
- Web Audio API procedural audio framework.

### Phase 2: WebRTC Multiplayer, In-World Wardrobe & Slap Physics `[COMPLETED]`
- Serverless peer-to-peer room hosting and joining using PeerJS (`SLOP-XXXX`).
- Automatic host migration / client state synchronization at 20 ticks/sec.
- In-world wardrobe dressing mirror: custom name input and hex color palette dye picker.
- Comic slap physics on Right-Click with knockback impulse and `BONK!` comic text popups.
- Training Dummy with physics spring recoil, damage numbers, and health bars.

### Phase 3: Equipment System, Ground Loot & Anime Gear Batches `[IN PROGRESS]`
- **Step 3.1: 6-Slot Equipment Architecture** `[COMPLETED]`
  - Slots: Helmet, Chest, Pants, Boots, Weapon (1H or 2H), Off-hand (Shield/Orb).
  - Dynamic recalculation of HP, speed, stamina regen, armor mitigation, and roll costs.
- **Step 3.2: Real-Time Combat & Shield Blocking** `[COMPLETED]`
  - Weapon-specific reach, cleave angle, critical hit calculations.
  - Active shield blocking with Right-Click (`isBlocking`) reducing incoming damage by up to 85%.
- **Step 3.3: Ground Loot Entities & Inventory UI** `[COMPLETED]`
  - Ground loot bobbing with glowing rarity beams (Common, Rare, Epic, Legendary, Mythic).
  - Proximity `[E]` key pickup.
  - Full Inventory Modal (`[I]` / `[Tab]`): 6 equipped slots + 10-slot backpack grid with Equip & Drop buttons.
  - P2P synchronization of dropped and picked-up loot across all clients.
- **Step 3.4: Anime Gear Batch 1 — Jujutsu Kaisen & Berserk** `[COMPLETED]`
  - **Gojo Satoru**: Blindfold of Six Eyes, High-Collar Tunic, Sorcerer Slacks, Loafers, Lapse Blue (1H), Reversal Red (Offhand).
    - Base Q: *Limitless Barrier* (spatial repulsion force field).
    - Full Set Q: *Hollow Purple* (screen darkens, launches massive 200px true-damage orb with heavy screen shake).
  - **Ryomen Sukuna**: Four-Eyed Crown, Malevolent Robe, Hakama, Zori, Kamutoke Dagger, Malevolent Cleaver, Hiten Spear.
    - Base Q: *Dismantle* (3 rapid razor wind cuts).
    - Full Set Q: *World Cutting Slash* (reality freezes monochrome, diagonal screen-bisecting dimensional rip).
  - **Toji Fushiguro**: Coiled Curse Worm, Compression Shirt, Gi Pants, Slippers, *Inverted Spear of Heaven & Thousand-Mile Chain (2H)*.
    - Base Q: *Spartan Front Kick* (heavy knockback lunge).
    - Full Set Q: *Thousand-Mile Chain Rampage* (360° sweeping whirlwind nullifying enemy shields).
  - **Guts**: Berserker Beast Helm, Berserker Plate, Greaves, Sollerets, *Dragon Slayer (2H)*.
    - Base Q: *Prosthetic Cannon Arm* (explosive artillery shell detonation).
    - Full Set Q: *Berserker Rage* (blood-red pulsing vignette, 100% damage invulnerability, violent screen shake, and anvil `CLANG!` hits).
  - **Procedural Synthesizers & Attack Animations**:
    - Dedicated Web Audio procedural synthesis for all weapons, hits, and abilities.
    - Bespoke attack animations, reach, kinematics, and VFX trails for every weapon.

---

### Step 3.5: Anime Gear Batch 2 — Attack on Titan, Cyberpunk & One Punch Man `[IN PROGRESS]`
- **Levi Ackerman Set (Attack on Titan)** `[COMPLETED]`:
  - *Items*: Survey Corps Hooded Cloak, 3D Maneuver Harness & Gas Canisters, Cavalry Trousers, Riding Boots, Dual Ultrahard Steel Snap Blades.
  - *Base Q*: **ODM Gas Boost**: Fires compressed steam gas backwards, lunging forward with a steam cloud and pushing away nearby enemies.
  - *Full Set Q*: **ODM Dual Grapple Wires & 360° Blade Whirlwind**: Fires dual unlimited-reach grapple cables towards the cursor, rapidly reeling Levi in at high velocity; only upon colliding with an enemy, unleashes a 360° spinning blade whirlwind ("The Titan Blender") with `SLASH! 🌀` and `WHIRLWIND! ⚔️` multi-hit slices!
- **David Martinez Set (Cyberpunk: Edgerunners)** `[UPCOMING]`:
  - *Items*: Kiroshi Optics Mk. 4, Gloria's High-Vis EMT Jacket, Streetkid Cargo Pants, Chrome Cyber-Sneakers, Carnage Shotgun, Gorilla Arms.
  - *Mechanics per User Feedback*: **Military-Grade Sandevistan**: Global slow-mo where time slows down to **10% speed for everyone else** (all monsters, projectiles, and other players), while David is the **only one moving at normal speed** for 4s with cyan and lime chromatic trails.
- **Saitama Set (One Punch Man)**:
  - *Items*: Polished Bald Scalp (+50 Armor), Yellow Hero Suit & Cape (+100 HP), Yellow Tights, Red Rubber Boots, Red Hero Glove, Supermarket Bargain Grocery Bag.
  - *Full Set Q*: **Serious Punch (マジ殴り)**: Screen turns stark black-and-white high-contrast manga line art; unleashes a titanic conical shockwave obliterating enemies with a giant `SERIOUS PUNCH!` banner.

---

### Step 3.6: Anime Gear Batch 3 — Fire Force, Tensura, Death Note & Re:Zero `[UPCOMING]`
- **Shinra Kusakabe & Arthur Boyle (Fire Force)**:
  - Devil's Footprints ignition boots (Adolla Flight & light-speed kick) & Excalibur (screen-spanning Violet Flash: Earth Divider).
- **Rimuru Tempest (That Time I Got Reincarnated as a Slime)**:
  - Shizu's Anti-Magic Mask, Demon Lord Coat, Demon Katana, and Beelzebuth (swirling black hole vortex devour).
- **Light Yagami (Death Note)**:
  - The Death Note & Quill Pen with Heart Attack 3-second skull countdown and `DELETE!` lightning strike.
- **Subaru Natsuki & Rem (Re:Zero)**:
  - Legendary Tracksuit (Return by Death passive rewind + Cor Leonis party health link) & Rem's 2-Handed Spiked Morningstar Flail (Oni Rampage frenzy).

---

### Phase 4: Procedural Dungeon Generation, Monster AI & Floor Descent `[PLANNED]`
- Binary Space Partitioning (BSP) / Cellular Automata dungeon generation:
  - Procedural rectangular & organic rooms, connecting corridors, torch placement, and dynamic fog of war.
- 4 monster archetypes:
  - *Slime Swarmer*: Fast, low HP, split on death.
  - *Skeleton Archer*: Ranged projectile kiter.
  - *Ironclad Brute*: Slow, high HP, telegraphed ground smash.
  - *Floor Guardian Mini-Boss*: Multi-phase boss encounter with telegraph zones and loot explosion.
- Floor exit gate and descent ritual circle to deeper floors with escalating difficulty modifiers.

---

### Phase 5: Downed / Revive Clutch System, Polish & Public Build `[PLANNED]`
- Downed crawl state: 30-second bleed-out countdown, crawling movement speed penalty.
- Teammate hold-`[E]` revive channel with revive progress circle.
- Ghost spectating mode if bleed-out expires until team reaches the next floor.
- Victory / Party Wipe summary screen with damage, revive, and floor depth stats.
- Performance optimization and production release packaging.
