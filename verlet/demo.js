const ctx = canvas.getContext('2d');
let width, height;
let points = [];
let constraints = [];
let mouse = { x: 0, y: 0, down: false };

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
resize();

// Create rope
const numPoints = 20;
const spacing = 10;
for(let i=0; i<numPoints; i++) {
    points.push({ x: width/2 + i*spacing, y: 50, oldX: width/2 + i*spacing, oldY: 50, pinned: i === 0 });
    if(i > 0) constraints.push({ a: points[i-1], b: points[i], dist: spacing });
}

canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
};

let running = true;
function update() {
    if(!running) return;

    // Physics
    points.forEach(p => {
        if(p.pinned) return;
        const vx = p.x - p.oldX;
        const vy = p.y - p.oldY;
        p.oldX = p.x;
        p.oldY = p.y;
        p.x += vx;
        p.y += vy + 0.2; // gravity
    });

    // Constraints
    for(let j=0; j<5; j++) {
        constraints.forEach(c => {
            const dx = c.b.x - c.a.x;
            const dy = c.b.y - c.a.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const diff = (c.dist - dist) / dist * 0.5;
            const ox = dx * diff;
            const oy = dy * diff;
            if(!c.a.pinned) { c.a.x -= ox; c.a.y -= oy; }
            if(!c.b.pinned) { c.b.x += ox; c.b.y += oy; }
        });
    }

    // Interaction
    points[points.length-1].x = mouse.x;
    points[points.length-1].y = mouse.y;

    // Draw
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    points.forEach((p, i) => {
        if(i===0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    requestAnimationFrame(update);
}
update();

return {
    destroy: () => { running = false; }
};
