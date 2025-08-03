const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// player image
const playerImage = new Image();
playerImage.src = 'resources/player.png';

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
        this.x = 50; // Starting x position
        this.y = GROUND_Y - height; // Starting y position, adjusted to be on the ground
        // Adjusted width and height for better proportions
        this.width = width; 
        this.height = height; 
        this.velocityX = 0;
        this.velocityY = 0;
        this.speed = 5;
        this.jumpStrength = 12;
        this.onGround = false;
        this.imageRight = playerImage; // Image for right facing
        this.imageLeft = playerImage; // Image for left facing (same image for now)
        this.facing = 'right'; // Default facing direction
    }

    render() {
    const image = this.facing === 'left' ? this.imageLeft : this.imageRight;
    const scale = 2.5; // Scale factor for the image

    const drawWidth = this.width * scale;
    const drawHeight = this.height * scale;

    // Adjust so the bottom of the image aligns with bottom of player box
    const drawX = this.x - (drawWidth - this.width) / 2;
    const drawY = this.y + this.height - drawHeight;

    ctx.save();

    if (this.facing === 'left') {
        // Flip horizontally around the image center
        ctx.scale(-1, 1);
        ctx.drawImage(
            image,
            -drawX - drawWidth,
            drawY,
            drawWidth,
            drawHeight
        );
    } else {
        ctx.drawImage(
            image,
            drawX,
            drawY,
            drawWidth,
            drawHeight
        );
    }

    ctx.restore();
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

playerImage.onload = () => { animate(); }

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'ArrowRight':
        case 'KeyD':
            player.velocityX = player.speed;
            player.facing = 'right'; // Update facing direction
            break;
        case 'ArrowLeft':
        case 'KeyA':
            player.velocityX = -player.speed;
            player.facing = 'left'; // Update facing direction
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