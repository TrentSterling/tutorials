const ctx = canvas.getContext('2d');
let width, height;
let mouse = { x: 0, y: 0 };

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
}
resize();

canvas.onmousemove = e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
};

function sdfCircle(px, py, cx, cy, r) {
    const dx = px - cx;
    const dy = py - cy;
    return Math.sqrt(dx*dx + dy*dy) - r;
}

function sdfBox(px, py, bx, by, bw, bh) {
    const dx = Math.abs(px - bx) - bw;
    const dy = Math.abs(py - by) - bh;
    return Math.sqrt(Math.max(dx, 0)**2 + Math.max(dy, 0)**2) + Math.min(Math.max(dx, dy), 0);
}

let running = true;
function update() {
    if (!running) return;

    // We'll draw at a lower resolution for performance since this is JS-based per-pixel
    const res = 10;
    ctx.clearRect(0,0,width,height);

    for(let y=0; y<height; y+=res) {
        for(let x=0; x<width; x+=res) {
            const d1 = sdfCircle(x, y, mouse.x, mouse.y, 40);
            const d2 = sdfBox(x, y, width/2, height/2, 50, 30);
            const d = Math.min(d1, d2); // Union

            const intensity = Math.max(0, 1 - Math.abs(d) / 100);
            if (d < 0) {
                ctx.fillStyle = `rgba(56, 189, 248, ${0.3 + intensity * 0.7})`;
            } else {
                ctx.fillStyle = `rgba(30, 41, 59, ${intensity * 0.5})`;
            }
            ctx.fillRect(x, y, res, res);
        }
    }

    ctx.fillStyle = '#fff';
    ctx.font = '10px Inter';
    ctx.fillText('Move mouse to combine Circle SDF with Box SDF (Union)', 10, height - 10);

    requestAnimationFrame(update);
}
update();

return { destroy: () => { running = false; } };
