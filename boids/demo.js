const ctx = canvas.getContext('2d');
let width, height;
let boids = [];
const numBoids = 100;
const visualRadius = 40;
const minDistance = 15;
const maxSpeed = 3;
const cohesionWeight = 0.01;
const alignmentWeight = 0.05;
const separationWeight = 0.05;

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
resize();

// Initialize Boids
for(let i=0; i<numBoids; i++) {
    boids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
    });
}

function distance(b1, b2) {
    return Math.sqrt((b1.x - b2.x)**2 + (b1.y - b2.y)**2);
}

let running = true;
function update() {
    if(!running) return;

    for (let b of boids) {
        let centerX = 0, centerY = 0;
        let avgVx = 0, avgVy = 0;
        let neighbors = 0;
        let closeDx = 0, closeDy = 0;

        for (let other of boids) {
            if (b === other) continue;
            const d = distance(b, other);

            if (d < visualRadius) {
                // Cohesion Sum
                centerX += other.x;
                centerY += other.y;
                // Alignment Sum
                avgVx += other.vx;
                avgVy += other.vy;
                neighbors++;
            }

            if (d < minDistance) {
                // Separation Sum
                closeDx += b.x - other.x;
                closeDy += b.y - other.y;
            }
        }

        if (neighbors > 0) {
            centerX /= neighbors;
            centerY /= neighbors;
            avgVx /= neighbors;
            avgVy /= neighbors;

            // Apply Cohesion
            b.vx += (centerX - b.x) * cohesionWeight;
            b.vy += (centerY - b.y) * cohesionWeight;

            // Apply Alignment
            b.vx += (avgVx - b.vx) * alignmentWeight;
            b.vy += (avgVy - b.vy) * alignmentWeight;
        }

        // Apply Separation
        b.vx += closeDx * separationWeight;
        b.vy += closeDy * separationWeight;

        // Speed limit
        const speed = Math.sqrt(b.vx*b.vx + b.vy*b.vy);
        if (speed > maxSpeed) {
            b.vx = (b.vx / speed) * maxSpeed;
            b.vy = (b.vy / speed) * maxSpeed;
        }

        // Move
        b.x += b.vx;
        b.y += b.vy;

        // Wrap edges
        if (b.x < 0) b.x = width;
        if (b.x > width) b.x = 0;
        if (b.y < 0) b.y = height;
        if (b.y > height) b.y = 0;
    }

    // Draw
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#38bdf8';
    for (let b of boids) {
        const angle = Math.atan2(b.vy, b.vx);
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    requestAnimationFrame(update);
}
update();

return {
    destroy: () => { running = false; }
};
