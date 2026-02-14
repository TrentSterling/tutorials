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

let running = true;
function update() {
    if (!running) return;

    ctx.clearRect(0,0,width,height);
    
    const centerX = width/2;
    const centerY = height/2;
    const radius = 80;

    // Use mouse position to control PBR properties
    const roughness = Math.min(1, mouse.x / width);
    const metallic = Math.min(1, mouse.y / height);

    // 1. Draw Base (Albedo)
    const baseCol = metallic > 0.5 ? '#facc15' : '#38bdf8'; // Gold vs Plastic
    ctx.fillStyle = baseCol;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.fill();

    // 2. Diffuse Shading
    const grad = ctx.createRadialGradient(centerX - 30, centerY - 30, 10, centerX, centerY, radius);
    grad.addColorStop(0, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.fill();

    // 3. PBR Highlight (Specular)
    const specSize = radius * (1 - roughness);
    const specOpacity = 0.8 * (metallic > 0.5 ? 1 : 0.5);
    const specGrad = ctx.createRadialGradient(centerX - 30, centerY - 30, 0, centerX - 30, centerY - 30, specSize);
    specGrad.addColorStop(0, `rgba(255,255,255,${specOpacity})`);
    specGrad.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.fillStyle = specGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI*2);
    ctx.fill();

    // UI
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText(`X: Roughness (${roughness.toFixed(2)})`, 10, height - 25);
    ctx.fillText(`Y: Metallic (${metallic.toFixed(2)})`, 10, height - 10);

    requestAnimationFrame(update);
}
update();

return { destroy: () => { running = false; } };
