import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { Player } from './player.js';
import { AudioManager } from './audio.js';
import { ParticleManager } from './particles.js';
import { NetworkManager } from './network.js';
import { Dummy } from './dummy.js';
import { ReadyCircle } from './readyCircle.js';
import { CustomizationStation } from './customizationStation.js';
import { ITEM_CATALOG, ItemRarity } from './items.js';
import { CombatSystem } from './combat.js';
import { GroundLoot } from './groundLoot.js';

const canvas = document.getElementById('game-canvas');
const renderer = new Renderer(canvas);
const input = new InputManager();
const player = new Player(0, 0);

// Equip starter equipment set
player.equipItem(ITEM_CATALOG['rusty_sword']);
player.equipItem(ITEM_CATALOG['wooden_buckler']);
player.equipItem(ITEM_CATALOG['iron_visor']);
player.equipItem(ITEM_CATALOG['leather_tunic']);
player.equipItem(ITEM_CATALOG['cloth_pants']);
player.equipItem(ITEM_CATALOG['travel_boots']);

const audio = new AudioManager();
const particles = new ParticleManager();
const network = new NetworkManager();
const combat = new CombatSystem(audio, particles);

// Lobby entities
const dummy = new Dummy(0, -180);
const readyCircle = new ReadyCircle(0, 160, 75);
const wardrobeStation = new CustomizationStation(-240, -120);

// Ground loot items in world (trading & drops)
const groundItems = new Map();

// Spawn some demo loot items in the lobby to test pickup & trading!
const demoLoot1 = new GroundLoot(ITEM_CATALOG['titan_greatsword'], -120, 0);
const demoLoot2 = new GroundLoot(ITEM_CATALOG['iron_tower_shield'], 120, 0);
const demoLoot3 = new GroundLoot(ITEM_CATALOG['horned_barbarian_helm'], 160, -80);
const demoLoot4 = new GroundLoot(ITEM_CATALOG['celestial_mantle'], -160, -80);

groundItems.set(demoLoot1.id, demoLoot1);
groundItems.set(demoLoot2.id, demoLoot2);
groundItems.set(demoLoot3.id, demoLoot3);
groundItems.set(demoLoot4.id, demoLoot4);

const dungeonBounds = { minX: -600, minY: -600, maxX: 600, maxY: 600 };

// Auto-initialize audio on user gesture
const unlockAudio = () => {
  audio.init();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('click', unlockAudio);
window.addEventListener('keydown', unlockAudio);

readyCircle.onDescentTriggered = () => {
  audio.playDescentFanfare();
  particles.spawnComicText(readyCircle.x, readyCircle.y - 30, 'DESCENDING!', '#00ff88');

  const hudFloor = document.getElementById('hud-floor');
  if (hudFloor) {
    hudFloor.textContent = '1 (READY)';
    hudFloor.style.color = '#00ff88';
    hudFloor.style.textShadow = '0 0 15px #00ff88';
  }
};

// --- INVENTORY UI & GROUND LOOT TRADING ---
const invModal = document.getElementById('inventory-modal');
const btnCloseInventory = document.getElementById('btn-close-inventory');
const backpackGrid = document.getElementById('backpack-grid');
const invCount = document.getElementById('inv-count');

function toggleInventory() {
  if (invModal.classList.contains('hidden')) {
    openInventory();
  } else {
    closeInventory();
  }
}

function openInventory() {
  invModal.classList.remove('hidden');
  renderInventoryUI();
  audio.playSwing();
}

function closeInventory() {
  invModal.classList.add('hidden');
  audio.playFootstep();
}

btnCloseInventory.addEventListener('click', closeInventory);

function renderInventoryUI() {
  // 1. Render 6 Equipment slots
  const slots = ['helmet', 'chest', 'pants', 'boots', 'weapon', 'offhand'];
  slots.forEach((slot) => {
    const el = document.getElementById(`slot-${slot}`);
    if (!el) return;
    const item = player.equipment[slot];
    if (item) {
      const rarity = ItemRarity[item.rarity] || ItemRarity.COMMON;
      el.innerHTML = `
        <span style="color:${rarity.color}">${item.name}</span>
        <button class="item-action-btn unequip-btn" data-slot="${slot}">UNEQUIP</button>
      `;
    } else {
      el.innerHTML = `<span style="color:#64748b;font-weight:500;">(Empty)</span>`;
    }
  });

  // Attach unequip listeners
  document.querySelectorAll('.unequip-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const slot = btn.getAttribute('data-slot');
      if (player.inventory.length >= player.maxInventorySize) {
        alert('Backpack is full!');
        return;
      }
      const unequipped = player.unequipSlot(slot);
      if (unequipped) {
        player.inventory.push(unequipped);
        audio.playSwing();
        renderInventoryUI();
        broadcastMyState();
      }
    });
  });

  // 2. Render Backpack items
  backpackGrid.innerHTML = '';
  invCount.textContent = player.inventory.length;

  if (player.inventory.length === 0) {
    backpackGrid.innerHTML = `<span style="grid-column: span 2; color:#64748b; padding:12px; font-size:0.8rem;">Your backpack is empty. Find loot on the ground!</span>`;
  }

  player.inventory.forEach((item, index) => {
    const rarity = ItemRarity[item.rarity] || ItemRarity.COMMON;
    const card = document.createElement('div');
    card.className = 'backpack-item-card';
    card.innerHTML = `
      <div>
        <strong style="color:${rarity.color}">${item.name}</strong>
        <div style="font-size:0.7rem; color:#94a3b8;">${item.desc || ''}</div>
      </div>
      <div class="backpack-actions">
        <button class="item-action-btn equip-item-btn" data-idx="${index}">EQUIP</button>
        <button class="item-action-btn drop-item-btn" style="border-color:#ef4444;" data-idx="${index}">DROP</button>
      </div>
    `;
    backpackGrid.appendChild(card);
  });

  // Equip listeners
  document.querySelectorAll('.equip-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      const item = player.inventory.splice(idx, 1)[0];
      if (item) {
        const displaced = player.equipItem(item);
        if (displaced && displaced.length > 0) {
          player.inventory.push(...displaced);
        }
        audio.playSwing();
        particles.spawnComicText(player.x, player.y - 28, `EQUIPPED!`, '#00ff88');
        renderInventoryUI();
        broadcastMyState();
      }
    });
  });

  // Drop listeners (Drops item onto dungeon ground for friends!)
  document.querySelectorAll('.drop-item-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-idx'));
      const item = player.inventory.splice(idx, 1)[0];
      if (item) {
        // Drop on ground slightly in front of player
        const dropX = player.x + Math.cos(player.angle) * 35;
        const dropY = player.y + Math.sin(player.angle) * 35;
        const newDrop = new GroundLoot(item, dropX, dropY);
        groundItems.set(newDrop.id, newDrop);

        // Sync drop to peers
        const dropMsg = {
          type: 'LOOT_SPAWNED',
          id: newDrop.id,
          item: newDrop.item,
          x: dropX,
          y: dropY
        };
        if (network.isHost) network.broadcast(dropMsg);
        else network.sendToHost(dropMsg);

        audio.playBonk();
        particles.spawnComicText(player.x, player.y - 28, `DROPPED!`, '#ffb800');
        renderInventoryUI();
        broadcastMyState();
      }
    });
  });
}

// Pick up nearby ground loot with [E]
function tryPickupNearbyLoot() {
  for (const [id, loot] of groundItems.entries()) {
    if (loot.isNear(player)) {
      if (player.inventory.length >= player.maxInventorySize) {
        particles.spawnComicText(player.x, player.y - 30, 'BACKPACK FULL!', '#ef4444');
        return;
      }

      // Add to inventory
      player.inventory.push(loot.item);
      groundItems.delete(id);

      // Sync pickup
      const pickupMsg = { type: 'LOOT_PICKED_UP', id };
      if (network.isHost) network.broadcast(pickupMsg);
      else network.sendToHost(pickupMsg);

      audio.playDescentFanfare();
      particles.spawnComicText(player.x, player.y - 28, `GOT ${loot.item.name}!`, '#fbbf24');
      if (!invModal.classList.contains('hidden')) renderInventoryUI();
      return;
    }
  }
}

// --- WARDROBE & DRESSING MIRROR LOGIC ---
const wardrobeModal = document.getElementById('wardrobe-modal');
const btnCloseWardrobe = document.getElementById('btn-close-wardrobe');
const wardrobePreviewCircle = document.getElementById('wardrobe-avatar-preview');
const inputPlayerName = document.getElementById('input-player-name');
const hudAvatar = document.getElementById('hud-avatar');
const hudPlayerName = document.getElementById('hud-player-name');

function openWardrobe() {
  wardrobeModal.classList.remove('hidden');
  inputPlayerName.focus();
  inputPlayerName.select();
  audio.playSwing();
}

function closeWardrobe() {
  wardrobeModal.classList.add('hidden');
  audio.playFootstep();
}

btnCloseWardrobe.addEventListener('click', closeWardrobe);

inputPlayerName.addEventListener('input', (e) => {
  player.name = e.target.value.trim() || 'SlopCrawler';
  hudPlayerName.textContent = player.name;
  broadcastMyState();
});

document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    player.color = btn.getAttribute('data-color');

    wardrobePreviewCircle.style.background = player.color;
    wardrobePreviewCircle.style.boxShadow = `0 0 16px ${player.color}`;
    hudAvatar.style.background = player.color;
    hudAvatar.style.boxShadow = `0 0 12px ${player.color}`;

    audio.playSwing();
    particles.spawnComicText(player.x, player.y - 20, 'DYE APPLIED!', player.color);
    broadcastMyState();
  });
});

// --- LOBBY CO-OP NETWORKING UI ---
const lobbyModal = document.getElementById('lobby-modal');
const btnOpenLobby = document.getElementById('btn-open-lobby');
const btnCloseLobby = document.getElementById('btn-close-lobby');
const btnCreateRoom = document.getElementById('btn-create-room');
const btnJoinRoom = document.getElementById('btn-join-room');
const inputRoomCode = document.getElementById('input-room-code');
const activeRoomBox = document.getElementById('lobby-active-room');
const displayRoomCode = document.getElementById('display-room-code');
const btnCopyLink = document.getElementById('btn-copy-link');
const partyCount = document.getElementById('party-count');
const partyRoster = document.getElementById('party-roster');
const hudNetworkStatus = document.getElementById('hud-network-status');

btnOpenLobby.addEventListener('click', () => lobbyModal.classList.remove('hidden'));
btnCloseLobby.addEventListener('click', () => lobbyModal.classList.add('hidden'));

function updatePartyRoster() {
  partyRoster.innerHTML = '';
  const myLi = document.createElement('li');
  myLi.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${player.color}"></span> ${player.name} (You) ${network.isHost ? '👑' : ''}`;
  partyRoster.appendChild(myLi);

  for (const [_, remote] of network.remotePlayers.entries()) {
    const li = document.createElement('li');
    li.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${remote.color || '#fff'}"></span> ${remote.name || 'Friend'}`;
    partyRoster.appendChild(li);
  }

  partyCount.textContent = network.remotePlayers.size + 1;
}

btnCreateRoom.addEventListener('click', async () => {
  btnCreateRoom.disabled = true;
  btnCreateRoom.textContent = 'CREATING...';
  try {
    const code = await network.createRoom();
    displayRoomCode.textContent = code;
    activeRoomBox.classList.remove('hidden');
    hudNetworkStatus.textContent = `HOST [${code}]`;
    updatePartyRoster();
  } catch (err) {
    alert('Failed to host room: ' + err.message);
  } finally {
    btnCreateRoom.disabled = false;
    btnCreateRoom.textContent = 'CREATE ROOM (HOST)';
  }
});

btnJoinRoom.addEventListener('click', async () => {
  const code = inputRoomCode.value.trim();
  if (!code) return alert('Please enter a room code (e.g. SLOP-XXXX)');

  btnJoinRoom.disabled = true;
  btnJoinRoom.textContent = 'JOINING...';
  try {
    await network.joinRoom(code);
    displayRoomCode.textContent = code;
    activeRoomBox.classList.remove('hidden');
    hudNetworkStatus.textContent = `CO-OP [${code}]`;
    updatePartyRoster();
    broadcastMyState();
  } catch (err) {
    alert('Could not join room. Make sure the host has created it!');
  } finally {
    btnJoinRoom.disabled = false;
    btnJoinRoom.textContent = 'JOIN';
  }
});

btnCopyLink.addEventListener('click', () => {
  const url = `${window.location.origin}${window.location.pathname}?room=${network.roomCode}`;
  navigator.clipboard.writeText(url);
  btnCopyLink.textContent = 'COPIED TO CLIPBOARD!';
  setTimeout(() => (btnCopyLink.textContent = 'COPY INVITE LINK'), 2000);
});

const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
  inputRoomCode.value = roomParam;
  lobbyModal.classList.remove('hidden');
}

function broadcastMyState() {
  const payload = {
    type: 'PLAYER_STATE',
    x: player.x,
    y: player.y,
    angle: player.angle,
    color: player.color,
    name: player.name,
    isRolling: player.isRolling,
    isAttacking: player.isAttacking,
    attackProgress: player.attackProgress,
    isSlapping: player.isSlapping,
    slapProgress: player.slapProgress,
    isBlocking: player.isBlocking,
    hp: player.hp,
    maxHp: player.maxHp,
    equipment: player.equipment
  };

  if (network.isHost) {
    network.broadcast(payload);
  } else {
    network.sendToHost(payload);
  }
}

network.onPlayerJoined = () => {
  updatePartyRoster();
  broadcastMyState();

  // If host, sync all ground loot to newly joined player
  if (network.isHost) {
    for (const [id, loot] of groundItems.entries()) {
      network.broadcast({
        type: 'LOOT_SPAWNED',
        id: loot.id,
        item: loot.item,
        x: loot.x,
        y: loot.y
      });
    }
  }
};

network.onPlayerLeft = () => {
  updatePartyRoster();
};

network.onMessageReceived = (fromPeerId, msg) => {
  if (msg.type === 'PLAYER_STATE') {
    network.remotePlayers.set(fromPeerId, {
      ...msg,
      lastSeen: performance.now()
    });
    updatePartyRoster();
  } else if (msg.type === 'SLAP_KNOCKBACK') {
    if (msg.targetPeerId === network.myPeerId) {
      player.applyKnockback(msg.kx, msg.ky);
      audio.playBonk();
      particles.spawnComicText(player.x, player.y - 20, 'BONK!', '#ff0055');
    }
  } else if (msg.type === 'DUMMY_HIT') {
    dummy.takeHit(msg.damage, msg.angle);
    audio.playBonk();
    const hitLabel = msg.isCrit ? `CRIT! -${msg.damage}` : `-${msg.damage}`;
    particles.spawnComicText(dummy.x, dummy.y - 24, hitLabel, msg.isCrit ? '#ff0055' : '#ffea00');
  } else if (msg.type === 'LOOT_SPAWNED') {
    const dropped = new GroundLoot(msg.item, msg.x, msg.y, msg.id);
    groundItems.set(dropped.id, dropped);
    audio.playBonk();
  } else if (msg.type === 'LOOT_PICKED_UP') {
    groundItems.delete(msg.id);
  }
};

setInterval(() => {
  if (network.connections.size > 0) {
    broadcastMyState();
  }
}, 50);

// --- COMBAT WEAPON & BLOCKING LOGIC ---
function handleAttacks() {
  const targets = [dummy, ...network.remotePlayers.values()];
  const hits = combat.performWeaponAttack(player, targets);

  for (const hit of hits) {
    if (hit.target === dummy) {
      dummy.takeHit(hit.damage, hit.angle);
      audio.playSwing();
      const popupText = hit.isCrit ? `CRIT! -${hit.damage}` : `HIT! -${hit.damage}`;
      particles.spawnComicText(dummy.x, dummy.y - 24, popupText, hit.isCrit ? '#ff0055' : '#fbbf24');

      const hitMsg = { type: 'DUMMY_HIT', damage: hit.damage, angle: hit.angle, isCrit: hit.isCrit };
      if (network.isHost) network.broadcast(hitMsg);
      else network.sendToHost(hitMsg);
    } else {
      for (const [peerId, remote] of network.remotePlayers.entries()) {
        if (remote === hit.target) {
          const kx = Math.cos(hit.angle) * hit.knockback;
          const ky = Math.sin(hit.angle) * hit.knockback;

          const slapMsg = { type: 'SLAP_KNOCKBACK', targetPeerId: peerId, kx, ky };
          if (network.isHost) network.broadcast(slapMsg);
          else network.sendToHost(slapMsg);

          audio.playBonk();
          particles.spawnComicText(remote.x, remote.y - 20, hit.isBlocked ? 'BLOCKED!' : 'WHACK!', '#ff3366');
        }
      }
    }
  }
}

// --- MAIN GAME LOOP ---
let lastTime = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  const wasRolling = player.isRolling;
  const modalsOpen =
    !wardrobeModal.classList.contains('hidden') ||
    !lobbyModal.classList.contains('hidden') ||
    !invModal.classList.contains('hidden');

  // Inventory toggle hotkeys: I or Tab
  if (input.justPressedI || (input.keys.tab && !input.tabHandled)) {
    input.tabHandled = true;
    toggleInventory();
  }
  if (!input.keys.tab) input.tabHandled = false;

  // ESC closes any open modal
  if (input.keys.escape) {
    if (!invModal.classList.contains('hidden')) closeInventory();
    if (!wardrobeModal.classList.contains('hidden')) closeWardrobe();
    if (!lobbyModal.classList.contains('hidden')) lobbyModal.classList.add('hidden');
  }

  // Handle Shield Blocking
  if (!modalsOpen && input.mouse.rightDown && player.equipment?.offhand?.visual?.includes('shield')) {
    if (!player.isBlocking) {
      player.isBlocking = true;
      audio.playSwing();
      broadcastMyState();
    }
  } else {
    if (player.isBlocking) {
      player.isBlocking = false;
      broadcastMyState();
    }
  }

  // 1. Update entities
  player.update(dt, input, dungeonBounds);
  dummy.update(dt);
  readyCircle.update(dt, player, network.remotePlayers);
  wardrobeStation.update(dt);
  player.syncHUD();

  // Update ground loot bobbing
  for (const [_, loot] of groundItems.entries()) {
    loot.update(dt);
  }

  // [E] Key interactions (Pick up loot OR Open Mirror)
  if (input.justPressedE && !modalsOpen) {
    if (wardrobeStation.isPlayerNearby(player)) {
      openWardrobe();
    } else {
      tryPickupNearbyLoot();
    }
  }

  // [Q] Key: Chest piece active ability
  if (input.keys.q && !modalsOpen) {
    combat.triggerChestAbility(player);
  }

  // Left Shift Roll
  if (!wasRolling && player.isRolling) {
    audio.playRoll();
    particles.spawnDashBurst(player.x, player.y, Math.atan2(player.rollDirY, player.rollDirX), player.color);
    particles.spawnComicText(player.x, player.y - 12, 'DODGE!', '#00f0ff');
    broadcastMyState();
  }

  // Left Click Weapon Attack
  if (input.justPressedLeft && !modalsOpen) {
    player.triggerAttack();
    audio.playSwing();
    handleAttacks();
    broadcastMyState();
  }

  // Right Click Slap
  if (input.justPressedRight && !modalsOpen && !player.isBlocking) {
    player.triggerSlap();
    audio.playBonk();
    particles.spawnComicText(
      player.x + Math.cos(player.angle) * 32,
      player.y + Math.sin(player.angle) * 32,
      'BONK!',
      '#ff0055'
    );
    handleAttacks();
    broadcastMyState();
  }

  // 2. Update particles
  particles.update(dt);

  // 3. Render frame
  renderer.clear();
  renderer.beginCamera(player.x, player.y);

  // Background stone floor
  renderer.drawDungeonFloor(dungeonBounds);

  // Ready Ritual Circle
  readyCircle.draw(renderer.ctx);

  // Corner torches
  renderer.drawTorch(-560, -560, now * 0.001);
  renderer.drawTorch(560, -560, now * 0.001);
  renderer.drawTorch(-560, 560, now * 0.001);
  renderer.drawTorch(560, 560, now * 0.001);

  // Wardrobe Station
  wardrobeStation.draw(renderer.ctx, player);

  // Ground Loot Items (with glowing rarity beams and proximity [E] pickup)
  for (const [_, loot] of groundItems.entries()) {
    loot.draw(renderer.ctx, loot.isNear(player));
  }

  // Training Dummy
  dummy.draw(renderer.ctx);

  // Dash after-images & particles
  renderer.drawAfterImages(player.afterImages);
  particles.draw(renderer.ctx);

  // Draw remote peers
  for (const [_, remote] of network.remotePlayers.entries()) {
    renderer.drawCharacter(remote);
  }

  // Draw local player
  renderer.drawCharacter(player);

  renderer.endCamera();

  // 4. Clear single-frame input flags
  input.endFrame();

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
console.log('Step 3.3: Ground Loot, Inventory UI, and Trading integrated successfully');
