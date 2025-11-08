import * as geometry from './geometry.js';

const state = {
	k: 2,
	points: [],
	mode: 'add', // 'view' | 'add' | 'drag' | 'delete'
	showHull: false,
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

function clearCanvas() {
	state.points = [];
	state.history = [];
	state.future = [];
	state.hull = null;
	setCanvasMode('add');
	drawAndStats();
}

const $ = (id) => document.getElementById(id);
window.addEventListener('load', () => {
	$("year").textContent = new Date().getFullYear();

	$('kRange').addEventListener('input', (e) => {
		state.k = parseInt(e.target.value, 10);
		$('kValue').textContent = state.k;
		$('stat-k').textContent = state.k;
	});

	$('mode-view').addEventListener('click', () => setCanvasMode('view'));
	$('mode-edit').addEventListener('click', () => setCanvasMode('add'));
	$('mode-drag').addEventListener('click', () => setCanvasMode('drag'));
	$('mode-delete').addEventListener('click', () => setCanvasMode('delete'));

	$('btn-random').addEventListener('click', () => { 
		state.points = setRandomPreset(Math.floor(Math.random() * 41));
		setPrimaryButton('rand');
		drawAndStats(); 
	});

	$('btn-k-out').addEventListener('click', () => {
		setPrimaryButton('k-out');
		drawAndStats();
	});

	$('btn-undo').addEventListener('click', () => { 
		setPrimaryButton('undo');
		drawAndStats(); 
	});

	$('btn-redo').addEventListener('click', () => { 
		setPrimaryButton('redo');
		drawAndStats(); 
	});

	$('btn-clear').addEventListener('click', () => { 
		setPrimaryButton('clear');
		clearCanvas(); 
		drawAndStats(); 
	});

	$('hull').addEventListener('change', (e) => { 
		state.showHull = e.target.checked; 
		drawAndStats();
	});

	$('pt-ids').addEventListener('change', (e) => { 
		state.showLabels = e.target.checked; 
		drawAndStats();
	});
});

function setPrimaryButton(button) {
	for (const elem of document.querySelectorAll('.btn')) {
		elem.classList.remove('primary');
	}

	if (button === 'rand') $('btn-random').classList.add('primary');
	else if (button === 'k-out') $('btn-k-out').classList.add('primary');
	else if (button === 'undo') $('btn-undo').classList.add('primary');  
	else if (button === 'redo') $('btn-redo').classList.add('primary');
	else if (button === 'clear') $('btn-clear').classList.add('primary');
}

function setCanvasMode(mode) {
	state.mode = mode;
	for (const elem of document.querySelectorAll('.seg-btn')) {
		elem.classList.remove('active');
	}

	if (mode === 'view') $('mode-view').classList.add('active');
	else if (mode === 'add') $('mode-edit').classList.add('active');
	else if (mode === 'drag') $('mode-drag').classList.add('active');  
	else if (mode === 'delete') $('mode-delete').classList.add('active');
}

function setup() {
	const container = $('canvas-container');
	canvas = createCanvas(container.clientWidth, container.clientHeight);
	canvas.parent('canvas-container');
	noLoop(); // draw on change
}

function windowResized() {
	const container = $('canvas-container');
	resizeCanvas(container.clientWidth, container.clientHeight);
	redraw();
}

function draw() {
	background(255);
	noFill();
	
	stroke(180);
	for (let y = 0; y < height; y += 40) { line(0, y, width, y); }
	for (let x = 0; x < width; x += 40) { line(x, 0, x, height); }

	if (state.showHull && state.hull) {
		stroke(50, 125,240);
		strokeWeight(2);
		noFill();
		geometry.drawPolygon(state.hull);
	}

	strokeWeight(1);
	noStroke();
	let idx = 1;
	for (const p of state.points) {
		fill(24);
		p.draw();
		if (state.showLabels) {
			fill(20);
			textAlign(LEFT, TOP);
			textSize(10);
			text(idx, p.x + 6, p.y + 6);
		}
		idx++;
	}

}

function mousePressed() {
	const insideCanvas = mouseX >= 0 && mouseX <= width 
	&& mouseY >= 0 && mouseY <= height;
	if (!insideCanvas) return;
	if (state.mode === 'add') {
		state.points.push(new geometry.Point(mouseX, mouseY));
		drawAndStats();
	} else if (state.mode === 'drag') {
		dragIndex = findNearestPoint(mouseX, mouseY);
	} else if (state.mode === 'delete') {
		const idx = findNearestPoint(mouseX, mouseY);
		if (idx !== -1) {
			state.points.splice(idx, 1);
			drawAndStats();
		}
	}
}

function mouseDragged() {
	if (state.mode === 'drag' && dragIndex !== -1) {
		state.points[dragIndex].x = mouseX;
		state.points[dragIndex].y = mouseY;
		drawAndStats();
	}
}

function mouseReleased() {
	if (state.mode === 'drag' && dragIndex !== -1) {
		drawAndStats();
		dragIndex = -1;
	}
}

function updateStats() {
	$('stat-n').textContent = state.points.length;
	$('stat-k').textContent = state.k;
	if (state.points.length >= 3) {
		state.hull = geometry.convexHullGrahamScan(state.points);
	} else { state.hull = null; }
	$('stat-h').textContent = state.hull ? state.hull.length : 0;
}

function drawAndStats() {
	updateStats();
	draw();
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