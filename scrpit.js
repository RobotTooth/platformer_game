const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Constants
const GRAVITY = 0.5;
const GROUND_HEIGHT = canvas.height / 5;
const GROUND_Y = canvas.height - GROUND_HEIGHT;

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render() {
    ctx.fillStyle = '#228B22';
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Optional border
    ctx.strokeStyle = '#000';
    ctx.strokeRect(this.x, this.y, this.width, this.height);
}
}

class Player {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpStrength = 12;
        this.onGround = false;
    }

    render() {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update(platforms) {
    // Apply gravity
    this.velocityY += GRAVITY;

    // Move horizontally
    this.x += this.velocityX;

    // Horizontal screen boundaries
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

    // Move vertically
    this.y += this.velocityY;

    // Assume player is falling
    this.onGround = false;

    // Check collision with ground
    if (this.y + this.height >= GROUND_Y) {
        this.y = GROUND_Y - this.height;
        this.velocityY = 0;
        this.onGround = true;
    }

    // Check collision with each platform (top surface only)
    for (let platform of platforms) {
        const playerBottom = this.y + this.height;
        const playerPrevBottom = this.y + this.height - this.velocityY;
        const platformTop = platform.y;

        const isFalling = this.velocityY >= 0;
        const isWithinX = this.x + this.width > platform.x && this.x < platform.x + platform.width;
        const justLanded = playerPrevBottom <= platformTop && playerBottom >= platformTop;

        if (isFalling && isWithinX && justLanded) {
            // Snap to platform surface
            this.y = platform.y - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
    }
}
}

const player = new Player(100, 100, 30, 30);

const platforms = [
    new Platform(200, 400, 100, 20),
    new Platform(400, 300, 150, 20),
    new Platform(600, 200, 100, 20),
];

function drawBackground() {
    ctx.fillStyle = '#87CEEB'; // Sky blue
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGround() {
    ctx.fillStyle = '#654321'; // brown
    ctx.fillRect(0, GROUND_Y, canvas.width, GROUND_HEIGHT);
}

function animate() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(); 
    drawGround();

    // Draw all platforms
    for (let platform of platforms) {
        platform.render();
    }

    player.update(platforms);
    player.render();

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            player.velocityX = player.speed;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            player.velocityX = -player.speed;
            break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
            if (player.onGround) {
                player.velocityY = -player.jumpStrength;
            }
            break;
    }
});

window.addEventListener('keyup', (e) => {
    if (
        e.code === 'ArrowRight' || e.code === 'KeyD' ||
        e.code === 'ArrowLeft'  || e.code === 'KeyA'
    ) {
        player.velocityX = 0;
    }
});