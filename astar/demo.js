const ctx = canvas.getContext('2d');
let width, height;
const gridSize = 20;
let rows, cols;
let grid = [];
let start = { r: 5, c: 5 };
let end = { r: 10, c: 15 };

function resize() {
    width = canvas.width = canvas.clientWidth;
    height = canvas.height = canvas.clientHeight;
    rows = Math.floor(height / gridSize);
    cols = Math.floor(width / gridSize);
}
resize();

canvas.onmousedown = e => {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / gridSize);
    const r = Math.floor((e.clientY - rect.top) / gridSize);
    if (e.shiftKey) start = { r, c };
    else end = { r, c };
};

function heuristic(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
}

let running = true;
function update() {
    if (!running) return;

    // A* implementation
    let openSet = [start];
    let cameFrom = new Map();
    let gScore = new Map();
    let fScore = new Map();
    const key = (p) => `${p.r},${p.c}`;

    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, end));

    let path = [];
    while (openSet.length > 0) {
        let current = openSet.reduce((a, b) => fScore.get(key(a)) < fScore.get(key(b)) ? a : b);
        
        if (current.r === end.r && current.c === end.c) {
            let temp = current;
            while (cameFrom.has(key(temp))) {
                path.push(temp);
                temp = cameFrom.get(key(temp));
            }
            break;
        }

        openSet = openSet.filter(p => p !== current);
        const neighbors = [
            { r: current.r + 1, c: current.c }, { r: current.r - 1, c: current.c },
            { r: current.r, c: current.c + 1 }, { r: current.r, c: current.c - 1 }
        ].filter(n => n.r >= 0 && n.r < rows && n.c >= 0 && n.c < cols);

        for (let n of neighbors) {
            let tentG = gScore.get(key(current)) + 1;
            if (!gScore.has(key(n)) || tentG < gScore.get(key(n))) {
                cameFrom.set(key(n), current);
                gScore.set(key(n), tentG);
                fScore.set(key(n), tentG + heuristic(n, end));
                if (!openSet.find(p => p.r === n.r && p.c === n.c)) openSet.push(n);
            }
        }
    }

    // Draw
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#1e293b';
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
        }
    }

    // Path
    ctx.fillStyle = '#38bdf8';
    path.forEach(p => ctx.fillRect(p.c * gridSize + 2, p.r * gridSize + 2, gridSize - 4, gridSize - 4));

    // Start/End
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(start.c * gridSize, start.r * gridSize, gridSize, gridSize);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(end.c * gridSize, end.r * gridSize, gridSize, gridSize);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter';
    ctx.fillText('Shift+Click to Move Start | Click to Move End', 10, height - 10);

    requestAnimationFrame(update);
}
update();

return { destroy: () => { running = false; } };
