/**
 * Input Manager for Dungeon Slop
 * Handles WASD keyboard movement, Left Shift for Roll/Dash, and mouse aim.
 */

export class InputManager {
  constructor() {
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
      e: false,
      q: false,
      i: false,
      tab: false
    };

    this.mouse = {
      screenX: window.innerWidth / 2,
      screenY: window.innerHeight / 2,
      leftDown: false,
      rightDown: false
    };

    this.justPressedShift = false;
    this.justPressedE = false;
    this.justPressedQ = false;
    this.justPressedI = false;
    this.justPressedLeft = false;
    this.justPressedRight = false;

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.w = true;
      if (key === 'a' || key === 'arrowleft') this.keys.a = true;
      if (key === 's' || key === 'arrowdown') this.keys.s = true;
      if (key === 'd' || key === 'arrowright') this.keys.d = true;
      if (key === 'e') {
        if (!this.keys.e && !e.repeat) this.justPressedE = true;
        this.keys.e = true;
      }
      if (key === 'q') {
        if (!this.keys.q && !e.repeat) this.justPressedQ = true;
        this.keys.q = true;
      }
      if (key === 'i') {
        if (!this.keys.i && !e.repeat) this.justPressedI = true;
        this.keys.i = true;
      }
      if (key === 'tab') {
        e.preventDefault();
        this.keys.tab = true;
      }
      if (e.code === 'ShiftLeft' || key === 'shift') {
        if (!this.keys.shift && !e.repeat) this.justPressedShift = true;
        this.keys.shift = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') this.keys.w = false;
      if (key === 'a' || key === 'arrowleft') this.keys.a = false;
      if (key === 's' || key === 'arrowdown') this.keys.s = false;
      if (key === 'd' || key === 'arrowright') this.keys.d = false;
      if (key === 'e') this.keys.e = false;
      if (key === 'q') this.keys.q = false;
      if (key === 'i') this.keys.i = false;
      if (key === 'tab') this.keys.tab = false;
      if (e.code === 'ShiftLeft' || key === 'shift') this.keys.shift = false;
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.screenX = e.clientX;
      this.mouse.screenY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.leftDown = true;
        this.justPressedLeft = true;
      }
      if (e.button === 2) {
        this.mouse.rightDown = true;
        this.justPressedRight = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouse.leftDown = false;
      if (e.button === 2) this.mouse.rightDown = false;
    });

    // Disable default right-click context menu on game canvas
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * Returns normalized movement vector from WASD
   */
  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.keys.w) dy -= 1;
    if (this.keys.s) dy += 1;
    if (this.keys.a) dx -= 1;
    if (this.keys.d) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx /= len;
      dy /= len;
    }

    return { dx, dy };
  }

  /**
   * Resets single-frame trigger flags
   */
  endFrame() {
    this.justPressedShift = false;
    this.justPressedE = false;
    this.justPressedQ = false;
    this.justPressedI = false;
    this.justPressedLeft = false;
    this.justPressedRight = false;
  }
}
