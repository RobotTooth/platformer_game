const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Constants
const GRAVITY = 0.5;
const GROUND_HEIGHT = canvas.height / 5;
const GROUND_Y = canvas.height - GROUND_HEIGHT;

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

    update() {
        // Apply gravity
        this.velocityY += GRAVITY;

        // Apply horizontal movement
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Ground collision
        if (this.y + this.height >= GROUND_Y) {
            this.y = GROUND_Y - this.height;
            this.velocityY = 0;
            this.onGround = true;
        } else {
            this.onGround = false;
        }

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
}

const player = new Player(100, 100, 30, 30);

function drawGround() {
    ctx.fillStyle = '#654321'; // brown
    ctx.fillRect(0, GROUND_Y, canvas.width, GROUND_HEIGHT);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    player.update();
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