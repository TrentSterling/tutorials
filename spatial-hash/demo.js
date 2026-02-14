const ctx = canvas.getContext('2d');
let width, height;
const cellSize = 50;
let particles = [];
let mouse = { x: 0, y: 0 };

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
resize();

for(let i=0; i<100; i++) {
    particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
    });
}

canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
};

let running = true;
function update() {
    if (!running) return;

    ctx.clearRect(0,0,width,height);

    // Draw Grid
    ctx.strokeStyle = '#1e293b';
    for(let x=0; x<width; x+=cellSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for(let y=0; y<height; y+=cellSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    // Highlight Query Cell
    const qx = Math.floor(mouse.x / cellSize) * cellSize;
    const qy = Math.floor(mouse.y / cellSize) * cellSize;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(qx - cellSize, qy - cellSize, cellSize * 3, cellSize * 3);

    // Update & Draw Particles
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if(p.x < 0 || p.x > width) p.vx *= -1;
        if(p.y < 0 || p.y > height) p.vy *= -1;

        const inRange = Math.abs(p.x - mouse.x) < cellSize * 1.5 && Math.abs(p.y - mouse.y) < cellSize * 1.5;
        ctx.fillStyle = inRange ? '#38bdf8' : '#64748b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText('Hover to see spatial query neighborhood', 10, height - 10);

    requestAnimationFrame(update);
}
update();

return { destroy: () => { running = false; } };
