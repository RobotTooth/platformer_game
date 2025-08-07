// === PLATFORMER GAME (Refactored for Clarity & Conciseness) ===

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.5;
const GROUND_Y = canvas.height - canvas.height / 5;

// Load Images
const images = {
    background: loadImage('resources/background_sprite.png'),
    ground: loadImage('resources/floor_tile_sprite.png'),
    player: loadImage('resources/player.png')
};

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

class Entity {
    constructor(x, y, w, h) {
        Object.assign(this, { x, y, w, h });
    }

    intersects(e) {
        return this.x < e.x + e.w && this.x + this.w > e.x && this.y < e.y + e.h && this.y + this.h > e.y;
    }
}

class Platform extends Entity {
    render() {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.strokeStyle = '#000';
        ctx.strokeRect(this.x, this.y, this.w, this.h);
    }
}

class Player extends Entity {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jump = 12;
        this.facing = 'right';
        this.onGround = false;
    }

    update(platforms) {
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        // Bounds
        this.x = Math.max(0, Math.min(canvas.width - this.w, this.x));
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
            const landed = this.vy >= 0 &&
                this.x + this.w > p.x && this.x < p.x + p.w &&
                prevBottom <= p.y && this.y + this.h >= p.y;
            if (landed) {
                this.y = p.y - this.h;
                this.vy = 0;
                this.onGround = true;
            }
        }
    }

    render() {
        const scale = 2.5, dw = this.w * scale, dh = this.h * scale;
        const dx = this.x - (dw - this.w) / 2;
        const dy = this.y + this.h - dh;
        ctx.save();
        if (this.facing === 'left') {
            ctx.scale(-1, 1);
            ctx.drawImage(images.player, -dx - dw, dy, dw, dh);
        } else {
            ctx.drawImage(images.player, dx, dy, dw, dh);
        }
        ctx.restore();
    }
}

const player = new Player(100, GROUND_Y, 30, 30);
const platforms = [
    new Platform(200, 400, 100, 20),
    new Platform(400, 300, 150, 20),
    new Platform(600, 200, 100, 20),
];

function drawSprite(img, sx, sy, sw, sh, dx, dy, scale = 1) {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw * scale, sh * scale);
}

function drawBackground() {
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const hillY = GROUND_Y - 200;
    const sx = 135, sy = 271, sw = 356, sh = 93;
    const dh = sh * (canvas.width / sw);
    ctx.drawImage(images.background, sx, sy, sw, sh, 0, hillY, canvas.width, dh);
}


function drawGround() {
    const sx = 87, sy = 378, sw = 433, sh = 66;
    const destH = sh, scale = 1, destY = GROUND_Y + 45 - destH;

    // Under fill
    const g = ctx.createLinearGradient(0, GROUND_Y + 35, 0, canvas.height);
    g.addColorStop(0, '#966042');
    g.addColorStop(1, '#4d422f');
    ctx.fillStyle = g;
    ctx.fillRect(0, GROUND_Y + 35, canvas.width, canvas.height - GROUND_Y - 35);

    for (let x = 0; x < canvas.width; x += sw - 30) {
        ctx.drawImage(images.ground, sx, sy, sw, sh, x, destY, sw * scale, sh * scale);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawGround();
    platforms.forEach(p => p.render());
    player.update(platforms);
    player.render();
    requestAnimationFrame(animate);
}

let loaded = 0;
Object.values(images).forEach(img => img.onload = () => (++loaded === 3 && animate()));

window.addEventListener('keydown', e => {
    if (['ArrowRight', 'KeyD'].includes(e.code)) {
        player.vx = player.speed;
        player.facing = 'right';
    }
    if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        player.vx = -player.speed;
        player.facing = 'left';
    }
    if (['ArrowUp', 'KeyW', 'Space'].includes(e.code) && player.onGround) {
        player.vy = -player.jump;
    }
});

window.addEventListener('keyup', e => {
    if (['ArrowRight', 'KeyD', 'ArrowLeft', 'KeyA'].includes(e.code)) player.vx = 0;
});
