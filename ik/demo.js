const ctx = canvas.getContext('2d');
let width, height;
let points = [];
let lengths = [80, 70, 60];
let mouse = { x: 0, y: 0 };

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
resize();

let root = { x: width/2, y: height/2 };
for(let i=0; i<4; i++) points.push({ x: root.x, y: root.y + i*50 });

canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
};

let running = true;
function update() {
    if(!running) return;

    root.x = width/2; root.y = height/2;

    // FABRIK
    // Backward
    points[3].x = mouse.x;
    points[3].y = mouse.y;
    for(let i=2; i>=0; i--) {
        const dx = points[i].x - points[i+1].x;
        const dy = points[i].y - points[i+1].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const ratio = lengths[i] / dist;
        points[i].x = points[i+1].x + dx * ratio;
        points[i].y = points[i+1].y + dy * ratio;
    }

    // Forward
    points[0].x = root.x;
    points[0].y = root.y;
    for(let i=0; i<3; i++) {
        const dx = points[i+1].x - points[i].x;
        const dy = points[i+1].y - points[i].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const ratio = lengths[i] / dist;
        points[i+1].x = points[i].x + dx * ratio;
        points[i+1].y = points[i].y + dy * ratio;
    }

    // Draw
    ctx.clearRect(0,0,width,height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    points.forEach((p, i) => {
        if(i===0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Joints
    ctx.fillStyle = '#fff';
    points.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fill();
    });

    requestAnimationFrame(update);
}
update();

return {
    destroy: () => { running = false; }
};
