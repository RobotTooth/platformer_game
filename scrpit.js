const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

class Player {
    constructor(x, y, width, height, velocity) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velocity = velocity;
    }

    render() {
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.velocity;
    }
}

const player = new Player(10, 10, 10, 10, 10);

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.requestAnimationFrame(animate);
    player.render();
    player.update();
    
}

animate();