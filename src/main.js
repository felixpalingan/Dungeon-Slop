import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { Player } from './player.js';
import { AudioManager } from './audio.js';
import { ParticleManager } from './particles.js';
import { NetworkManager } from './network.js';

const canvas = document.getElementById('game-canvas');
const renderer = new Renderer(canvas);
const input = new InputManager();
const player = new Player(0, 0);
const audio = new AudioManager();
const particles = new ParticleManager();
const network = new NetworkManager();

const dungeonBounds = { minX: -600, minY: -600, maxX: 600, maxY: 600 };

// Auto-initialize audio on user gesture
const unlockAudio = () => {
  audio.init();
  window.removeEventListener('click', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
};
window.addEventListener('click', unlockAudio);
window.addEventListener('keydown', unlockAudio);

// --- LOBBY UI & NETWORKING HOOKS ---
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
const inputPlayerName = document.getElementById('input-player-name');
const hudNetworkStatus = document.getElementById('hud-network-status');
const hudAvatar = document.getElementById('hud-avatar');
const hudPlayerName = document.getElementById('hud-player-name');

// Modal toggle
btnOpenLobby.addEventListener('click', () => lobbyModal.classList.remove('hidden'));
btnCloseLobby.addEventListener('click', () => lobbyModal.classList.add('hidden'));

// Player name change
inputPlayerName.addEventListener('input', (e) => {
  player.name = e.target.value.trim() || 'SlopCrawler';
  hudPlayerName.textContent = player.name;
  broadcastMyState();
});

// Color picker buttons
document.querySelectorAll('.color-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.color-btn').forEach((b) => b.classList.remove('selected'));
    btn.classList.add('selected');
    player.color = btn.getAttribute('data-color');
    hudAvatar.style.background = player.color;
    hudAvatar.style.boxShadow = `0 0 12px ${player.color}`;
    broadcastMyState();
  });
});

// Update party roster UI
function updatePartyRoster() {
  partyRoster.innerHTML = '';

  // Local player
  const myLi = document.createElement('li');
  myLi.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${player.color}"></span> ${player.name} (You) ${network.isHost ? '👑' : ''}`;
  partyRoster.appendChild(myLi);

  // Remote peers
  for (const [_, remote] of network.remotePlayers.entries()) {
    const li = document.createElement('li');
    li.innerHTML = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${remote.color || '#fff'}"></span> ${remote.name || 'Friend'}`;
    partyRoster.appendChild(li);
  }

  partyCount.textContent = network.remotePlayers.size + 1;
}

// Host Room
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

// Join Room
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

    // Send my initial state to host immediately
    broadcastMyState();
  } catch (err) {
    alert('Could not join room. Make sure the host has created it!');
  } finally {
    btnJoinRoom.disabled = false;
    btnJoinRoom.textContent = 'JOIN';
  }
});

// Copy invite link
btnCopyLink.addEventListener('click', () => {
  const url = `${window.location.origin}${window.location.pathname}?room=${network.roomCode}`;
  navigator.clipboard.writeText(url);
  btnCopyLink.textContent = 'COPIED TO CLIPBOARD!';
  setTimeout(() => (btnCopyLink.textContent = 'COPY INVITE LINK'), 2000);
});

// Check URL params for ?room=SLOP-XXXX auto-fill
const urlParams = new URLSearchParams(window.location.search);
const roomParam = urlParams.get('room');
if (roomParam) {
  inputRoomCode.value = roomParam;
  lobbyModal.classList.remove('hidden');
}

// Broadcast local state across WebRTC
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
    hp: player.hp,
    maxHp: player.maxHp
  };

  if (network.isHost) {
    network.broadcast(payload);
  } else {
    network.sendToHost(payload);
  }
}

// Network callbacks
network.onPlayerJoined = (peerId) => {
  console.log('Player joined room:', peerId);
  updatePartyRoster();
  broadcastMyState();
};

network.onPlayerLeft = (peerId) => {
  updatePartyRoster();
};

network.onMessageReceived = (fromPeerId, msg) => {
  if (msg.type === 'PLAYER_STATE') {
    network.remotePlayers.set(fromPeerId, {
      ...msg,
      lastSeen: performance.now()
    });
    updatePartyRoster();
  } else if (msg.type === 'PLAYER_LEFT') {
    network.remotePlayers.delete(msg.peerId);
    updatePartyRoster();
  }
};

// Send state snapshot 20 times per second
setInterval(() => {
  if (network.connections.size > 0) {
    broadcastMyState();
  }
}, 50);

// --- MAIN GAME LOOP ---
let lastTime = performance.now();
function gameLoop(now) {
  const dt = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;

  const wasRolling = player.isRolling;

  // 1. Update local player
  player.update(dt, input, dungeonBounds);
  player.syncHUD();

  // Left Shift Roll
  if (!wasRolling && player.isRolling) {
    audio.playRoll();
    particles.spawnDashBurst(player.x, player.y, Math.atan2(player.rollDirY, player.rollDirX), player.color);
    particles.spawnComicText(player.x, player.y - 12, 'DODGE!', '#00f0ff');
    broadcastMyState();
  }

  // Left Click Attack
  if (input.justPressedLeft) {
    player.triggerAttack();
    audio.playSwing();
    particles.spawnComicText(
      player.x + Math.cos(player.angle) * 36,
      player.y + Math.sin(player.angle) * 36,
      'SWOOSH!',
      '#ffffff'
    );
    broadcastMyState();
  }

  // Right Click Slap
  if (input.justPressedRight) {
    player.triggerSlap();
    audio.playBonk();
    particles.spawnComicText(
      player.x + Math.cos(player.angle) * 32,
      player.y + Math.sin(player.angle) * 32,
      'BONK!',
      '#ff0055'
    );
    broadcastMyState();
  }

  // 2. Update particles
  particles.update(dt);

  // 3. Render frame
  renderer.clear();
  renderer.beginCamera(player.x, player.y);

  // Background stone floor
  renderer.drawDungeonFloor(dungeonBounds);

  // Decorative corner torches
  renderer.drawTorch(-560, -560, now * 0.001);
  renderer.drawTorch(560, -560, now * 0.001);
  renderer.drawTorch(-560, 560, now * 0.001);
  renderer.drawTorch(560, 560, now * 0.001);

  // Dash after-images & particles
  renderer.drawAfterImages(player.afterImages);
  particles.draw(renderer.ctx);

  // Draw remote players connected via WebRTC
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
console.log('Step 2.1: PeerJS WebRTC Lobby & Room Code Networking integrated successfully');
