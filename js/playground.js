import * as geometry from './geometry.js';

const state = {
    k: 2,
    points: [],
    mode: 'view', // 'view' | 'add' | 'drag'
    showHull: true,
    showLabels: false,
    history: [],
    future: [],
    polygons : [],
    hull : null
};

const $ = (id) => document.getElementById(id);
window.addEventListener('load', () => {
    $('#year').textContent = new Date().getFullYear();

    $('#kRange').addEventListener('input', (e) => {
        state.k = parseInt(e.target.value, 10);
        $('#kValue').textContent = state.k;
        $('#stat-k').textContent = state.k;
    });
});

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
    for (let y = 0; y < height; y += 40) {
        line(0, y, width, y);
    }

    for (let x = 0; x < width; x += 40) {
        line(x, 0, x, height);
    }
}

window.setup = setup;
window.draw = draw;
window.windowResized = windowResized;