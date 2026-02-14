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

function getVertices(x, y, w, h, angle) {
    const hw = w/2, hh = h/2;
    const sin = Math.sin(angle), cos = Math.cos(angle);
    return [
        { x: x + (-hw * cos - -hh * sin), y: y + (-hw * sin + -hh * cos) },
        { x: x + (hw * cos - -hh * sin), y: y + (hw * sin + -hh * cos) },
        { x: x + (hw * cos - hh * sin), y: y + (hw * sin + hh * cos) },
        { x: x + (-hw * cos - hh * sin), y: y + (-hw * sin + hh * cos) }
    ];
}

function project(verts, axis) {
    let min = Infinity, max = -Infinity;
    verts.forEach(v => {
        const dot = v.x * axis.x + v.y * axis.y;
        min = Math.min(min, dot);
        max = Math.max(max, dot);
    });
    return { min, max };
}

function isColliding(v1, v2) {
    const axes = [];
    [v1, v2].forEach(verts => {
        for(let i=0; i<verts.length; i++) {
            const p1 = verts[i];
            const p2 = verts[(i+1)%verts.length];
            const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
            axes.push({ x: -edge.y, y: edge.x }); // normal
        }
    });

    for(let axis of axes) {
        const mag = Math.sqrt(axis.x*axis.x + axis.y*axis.y);
        axis.x /= mag; axis.y /= mag;
        const p1 = project(v1, axis);
        const p2 = project(v2, axis);
        if(p1.max < p2.min || p2.max < p1.min) return false;
    }
    return true;
}

let running = true;
function update() {
    if(!running) return;

    const b1 = getVertices(width/2, height/2, 100, 60, 0.4);
    const b2 = getVertices(mouse.x, mouse.y, 80, 80, Date.now() * 0.001);

    const colliding = isColliding(b1, b2);

    ctx.clearRect(0,0,width,height);
    
    [b1, b2].forEach((verts, i) => {
        ctx.strokeStyle = colliding ? '#ef4444' : '#38bdf8';
        ctx.fillStyle = colliding ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        verts.forEach((v, j) => {
            if(j===0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    });

    requestAnimationFrame(update);
}
update();

return {
    destroy: () => { running = false; }
};
