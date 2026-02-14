const ctx = canvas.getContext('2d');
let width, height;
let mouse = { x: 0, y: 0 };
let posLerp = { x: 50, y: 100 };
let posFrim = { x: 50, y: 200 };

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

let running = true;
let lastTime = performance.now();

function update(time) {
    if(!running) return;
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    // Standard Lerp (FPS dependent simulation)
    // We'll use a fixed 'fake' dt for the standard lerp to show how it feels slow at low fps
    posLerp.x += (mouse.x - posLerp.x) * (5 * 0.016); // Fixed 60fps assumption
    posLerp.y += (mouse.y/2 + 50 - posLerp.y) * (5 * 0.016);

    // FRIM (The right way)
    const alpha = 1 - Math.exp(-5 * dt);
    posFrim.x += (mouse.x - posFrim.x) * alpha;
    posFrim.y += (mouse.y/2 + 150 - posFrim.y) * alpha;

    ctx.clearRect(0,0,width,height);
    
    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter';
    ctx.fillText('Standard Lerp (Fixed Speed)', 20, 80);
    ctx.fillText('FRIM (Exponential Decay)', 20, 180);

    // Standard
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(posLerp.x, posLerp.y, 10, 0, Math.PI*2);
    ctx.fill();

    // FRIM
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(posFrim.x, posFrim.y, 10, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(update);
}
requestAnimationFrame(update);

return {
    destroy: () => { running = false; }
};
