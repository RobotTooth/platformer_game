// === PLATFORMER GAME (Refactored for Clarity & Conciseness) ===


const LEVEL_WIDTH = 3000;
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let cameraX = 0;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.5;
const GROUND_Y = canvas.height - canvas.height / 5;

// Load Images
const images = {
  background: loadImage("resources/background_sprite.png"),
  ground: loadImage("resources/floor_tile_sprite.png"),
  player: loadImage("resources/walk.png"),
  end_of_level: loadImage("resources/egypt-exz.png"),
  platform_1: loadImage("resources/platform_1.png"),
  block: loadImage("resources/shining_red_block.png"),
};

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function updateCamera() {
  const playerCenterX = player.x + player.w / 2;
  const canvasCenterX = canvas.width / 2;
  cameraX = Math.max(0, playerCenterX - canvasCenterX);
  ctx.setTransform(1, 0, 0, 1, -cameraX, 0);
}

class Entity {
  constructor(x, y, w, h) {
    Object.assign(this, { x, y, w, h });
  }

  intersects(e) {
    return (
      this.x < e.x + e.w &&
      this.x + this.w > e.x &&
      this.y < e.y + e.h &&
      this.y + this.h > e.y
    );
  }
}

class Platform extends Entity {
  render() {
    if (this.w === 100 && this.h === 20 && images.platform_1.complete) {
      ctx.drawImage(
        images.platform_1,
        this.x,
        this.y,
        this.w,
        this.h
      );
    } else {
      ctx.fillStyle = "#228B22";
      ctx.fillRect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
  }
}

class Player extends Entity {
  constructor(x, y, w, h) {
    super(x, y, w, h);
    this.vx = 0;
    this.vy = 0;
    this.speed = 5;
    this.jump = 12;
    this.facing = "right";
    this.onGround = false;

    // --- Animation setup ---
    this.sprite = images.player; //  5-frame walk cycle sheet
    this.frameWidth = 359;   // adjust to your sheet frame size
    this.frameHeight = 649;
    this.currentFrame = 0;
    this.totalFrames = 5; // 4 frames in the walk cycle
    this.tickCount = 0;
    this.ticksPerFrame = 6; // lower = faster animation
  }

  update(platforms) {
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    // Bounds
    this.x = Math.max(0, Math.min(LEVEL_WIDTH - this.w, this.x));
    this.onGround = false;

    // Ground collision
    if (this.y + this.h >= GROUND_Y) {
      this.y = GROUND_Y - this.h;
      this.vy = 0;
      this.onGround = true;
    }

    // Platform collisions
    for (let p of platforms) {
      const prevBottom = this.y + this.h - this.vy;
      const landed =
        this.vy >= 0 &&
        this.x + this.w > p.x &&
        this.x < p.x + p.w &&
        prevBottom <= p.y &&
        this.y + this.h >= p.y;
      if (landed) {
        this.y = p.y - this.h;
        this.vy = 0;
        this.onGround = true;
      }
    }

    // --- Animation update ---
    if (this.vx !== 0) { // only animate when walking
      this.tickCount++;
      if (this.tickCount > this.ticksPerFrame) {
        this.tickCount = 0;
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      }
    } else {
      this.currentFrame = 0; // idle frame
    }
  }

  render() {
    const scale = 2.5,
      dw = this.w * scale,
      dh = this.h * scale;

    const dx = this.x - (dw - this.w) / 2;
    const dy = this.y + this.h - dh + 5;

    ctx.save();
    if (this.facing === "left") {
      ctx.scale(-1, 1);
      ctx.drawImage(
        this.sprite,
        this.currentFrame * this.frameWidth, 0, // source X,Y
        this.frameWidth, this.frameHeight,      // source W,H
        -dx - dw, dy, dw, dh                    // dest
      );
    } else {
      ctx.drawImage(
        this.sprite,
        this.currentFrame * this.frameWidth, 0, // source X,Y
        this.frameWidth, this.frameHeight,      // source W,H
        dx, dy, dw, dh                          // dest
      );
    }
    ctx.restore();
  }
}

const player = new Player(100, GROUND_Y, 30, 30);
const platforms = [
  new Platform(200, GROUND_Y - 100, 100, 20),
  new Platform(400, GROUND_Y - 200, 150, 20),
  new Platform(600, GROUND_Y - 300, 100, 20),
  new Platform(800, GROUND_Y - 150, 120, 20),
  new Platform(1000, GROUND_Y - 250, 100, 20),
  new Platform(1200, GROUND_Y - 180, 140, 20),
  new Platform(1400, GROUND_Y - 280, 110, 20),
  new Platform(1600, GROUND_Y - 130, 130, 20),
  new Platform(1800, GROUND_Y - 220, 100, 20),
  new Platform(2000, GROUND_Y - 300, 120, 20),
  new Platform(2200, GROUND_Y - 160, 150, 20),
  new Platform(2400, GROUND_Y - 240, 100, 20),
  new Platform(2600, GROUND_Y - 180, 120, 20),
  new Platform(2800, GROUND_Y - 290, 110, 20),
  new Platform(300, GROUND_Y - 50, 100, 20),
  new Platform(700, GROUND_Y - 70, 120, 20),
  new Platform(1100, GROUND_Y - 100, 100, 20),
  new Platform(1500, GROUND_Y - 50, 130, 20),
  new Platform(1900, GROUND_Y - 60, 100, 20),
  new Platform(2300, GROUND_Y - 80, 120, 20),
];

function drawSprite(img, sx, sy, sw, sh, dx, dy, scale = 1) {
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw * scale, sh * scale);
}

function drawBackground() {
  ctx.fillStyle = "#87CEEB";
  ctx.fillRect(0, 0, LEVEL_WIDTH + 500, canvas.height);
  const hillY = GROUND_Y - 200;
  const sx = 135,
    sy = 271,
    sw = 356,
    sh = 93;
  const dh = sh * (canvas.width / sw);

  // Parallax: move background slower than camera
  const parallaxFactor = 0.4; // Lower = slower background
  const bgOffset = cameraX * parallaxFactor;

  ctx.drawImage(
    images.background,
    sx, sy, sw, sh,
    -bgOffset, hillY, LEVEL_WIDTH + 1000, dh
  );
}

function drawGround() {
  const sx = 87,
    sy = 378,
    sw = 433,
    sh = 66;
  const destH = sh,
    scale = 1,
    destY = GROUND_Y + 50 - destH;

  // Under fill
  const g = ctx.createLinearGradient(0, GROUND_Y +35, 0, canvas.height);
  g.addColorStop(0, "#966042");
  g.addColorStop(1, "#4d422f");
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y + 35, LEVEL_WIDTH + 500, canvas.height - GROUND_Y - 35);

  for (let x = 0; x < LEVEL_WIDTH + 500; x += sw - 30) {
  ctx.drawImage(
    images.ground,
    sx,
    sy,
    sw,
    sh,
    x,
    destY,
    sw * scale,
    sh * scale
  );

  }
}

function drawEndOfLevel() {
  const sx = 0,
    sy = 0,
    sw = 1247,
    sh = 640;
  const scale = 1;
  const dx = LEVEL_WIDTH - (sw * 0.5)   * scale - 20; // 20px padding
  const dy = GROUND_Y - sh * scale - 15; // 20px padding
  
  ctx.drawImage(
    images.end_of_level,
    sx, sy, sw, sh,
    dx, dy,
    sw * scale, sh * scale
  );
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  updateCamera(); // <-- Apply camera transform globally
  drawBackground();
  drawGround();
  drawEndOfLevel();
  platforms.forEach((p) => p.render());
  player.update(platforms);
  player.render();
  requestAnimationFrame(animate);
}

let loaded = 0;
const totalImages = Object.keys(images).length;
Object.values(images).forEach(
  (img) => (img.onload = () => ++loaded === totalImages && animate())
);

window.addEventListener("keydown", (e) => {
  if (["ArrowRight", "KeyD"].includes(e.code)) {
    player.vx = player.speed;
    player.facing = "right";
  }
  if (["ArrowLeft", "KeyA"].includes(e.code)) {
    player.vx = -player.speed;
    player.facing = "left";
  }
  if (["ArrowUp", "KeyW", "Space"].includes(e.code) && player.onGround) {
    player.vy = -player.jump;
  }
});

window.addEventListener("keyup", (e) => {
  if (["ArrowRight", "KeyD", "ArrowLeft", "KeyA"].includes(e.code))
    player.vx = 0;
});
