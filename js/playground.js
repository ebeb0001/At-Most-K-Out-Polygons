import * as geometry from './geometry.js';

const state = {
    k: 2,
    points: [],
    mode: 'view', // 'view' | 'add' | 'drag' | 'delete'
    showHull: true,
    showLabels: false,
    history: [],
    future: [],
    polygons : [],
    hull : null
};

let canvas;
let dragIndex = -1;

function setRandomPreset(nb_points) {
    const points = [];
    for (let i = 0; i < nb_points; i++) {
        points.push(new geometry.Point(
            Math.floor(Math.random() * (width + 1)), 
            Math.floor(Math.random() * (height + 1))
        ));
    }
    return points;
}

const $ = (id) => document.getElementById(id);
window.addEventListener('load', () => {
    $("year").textContent = new Date().getFullYear();

    $('kRange').addEventListener('input', (e) => {
        state.k = parseInt(e.target.value, 10);
        $('kValue').textContent = state.k;
        $('stat-k').textContent = state.k;
    });

    $('mode-view').addEventListener('click', () => setMode('view'));
    $('mode-edit').addEventListener('click', () => setMode('add'));
    $('mode-drag').addEventListener('click', () => setMode('drag'));
    $('mode-delete').addEventListener('click', () => setMode('delete'));

    $('btn-random').addEventListener('click', () => { 
        state.points = setRandomPreset(Math.floor(Math.random() * 41)); 
        redrawAndStats(); 
    });
});

function setMode(m) {
    state.mode = m;
    for (const elem of document.querySelectorAll('.seg-btn')) {
        elem.classList.remove('active');
    }

    if (m === 'view') $('mode-view').classList.add('active');
    if (m === 'add') $('mode-edit').classList.add('active');
    if (m === 'drag') $('mode-drag').classList.add('active');  
    if (m === 'delete') $('mode-delete').classList.add('active');
}

function setup() {
    const container = document.getElementById('canvas-container');
    canvas = createCanvas(container.clientWidth, container.clientHeight);
    canvas.parent('canvas-container');
    noLoop(); // draw on change
}

function windowResized() {
    const container = document.getElementById('canvas-container');
    resizeCanvas(container.clientWidth, container.clientHeight);
    redraw();
}

function draw() {
    background(255);
    noFill();
    
    stroke(150);
    for (let y = 0; y < height; y += 40) { line(0, y, width, y); }
    for (let x = 0; x < width; x += 40) { line(x, 0, x, height); }

    noStroke();
    for (const p of state.points) {
        fill(24);
        circle(p.x, p.y, 8);
    }
}

function mousePressed() {
    const insideCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
    if (!insideCanvas) return;
    if (state.mode === 'add') {
        state.points.push(new geometry.Point(mouseX, mouseY));
        redrawAndStats();
    } else if (state.mode === 'drag') {
        dragIndex = findNearestPoint(mouseX, mouseY);
    } else if (state.mode === 'delete') {
        const idx = findNearestPoint(mouseX, mouseY);
        if (idx !== -1) {
            state.points.splice(idx, 1);
            redrawAndStats();
        }
    }
}

function mouseDragged() {
    if (state.mode === 'drag' && dragIndex !== -1) {
        state.points[dragIndex].x = mouseX;
        state.points[dragIndex].y = mouseY;
        redrawAndStats();
    }
}

function mouseReleased() {
    if (state.mode === 'drag' && dragIndex !== -1) {
        redrawAndStats();
        dragIndex = -1;
    }
}

function updateStats() {
    document.getElementById('stat-n').textContent = state.points.length;
    document.getElementById('stat-k').textContent = state.k;
    if (state.points.length >= 3) {
        // state.hull = geometry.convexHull(new Polygon(state.points));
    }
    document.getElementById('stat-h').textContent = state.hull ? state.hull.points.length : 0;
}

function redrawAndStats() {
    redraw();
    updateStats();
}

function findNearestPoint(x, y, r = 12) {
    let idx = -1, best = r * r;
    for (let i = 0; i < state.points.length; i++) {
        const p = state.points[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < best) {
            best = dist2;
            idx = i;
        }
    }
    return idx;
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;
window.mousePressed = mousePressed;
window.mouseDragged = mouseDragged;
window.mouseReleased = mouseReleased;