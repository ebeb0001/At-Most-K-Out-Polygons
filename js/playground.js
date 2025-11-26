import * as geometry from './geometry.js';
import * as enumarator from './enumerator.js';

const state = {
	k: 2,
	points: [],
	inside: [],
	outside: [],
	mode: 'add', // 'view' | 'add' | 'drag' | 'delete'
	showHull: false,
	showLabels: false,
	showInOutPoints: false,
	history: [],
	future: [],
	polygons : [],
	hull : [],
	history : [],
	future : [],
	idx : -1
};

let canvas;
let dragIndex = -1;

function setRandomPreset(nb_points) {
	const points = [];
	for (let i = 0; i < nb_points; i++) {
		const p = new geometry.Point(
			Math.floor(Math.random() * (width + 1)), 
			Math.floor(Math.random() * (height + 1))
		);
		points.push(p);
	}
	return geometry.generalPosition(points);
}

function clearCanvas() {
	state.points = [];
	state.history = [];
	state.future = [];
	state.inside = [];
	state.outside = [];
	state.hull = [];
	state.polygons = [];
	state.history = [];
	state.future = [];
	state.idx = -1;
	setCanvasMode('add');
	drawAndStats();
}

function saveHistory() {
	state.history.push(JSON.stringify(state.points));
	if (state.history.length > 200) {
		state.history.shift();
	}
	// console.log(state.history);
	state.future = [];
}

function undo() {
	if (state.history.length == 0) {
		return;
	}
	state.future.push(JSON.stringify(state.points));
	state.points = JSON.parse(state.history.pop());
	state.points = state.points.map((p) => new geometry.Point(p.x, p.y));
	// console.log(state.points);
	drawAndStats();
}

function redo() {
	if (state.history.length == 0) {
		return;
	}
	state.history.push(JSON.stringify(state.points));
	state.points = JSON.parse(state.future.pop());
	state.points = state.points.map((p) => new geometry.Point(p.x, p.y));
	drawAndStats();
}

const $ = (id) => document.getElementById(id);
window.addEventListener('load', () => {
	$("year").textContent = new Date().getFullYear();

	$('kRange').addEventListener('input', (e) => {
		state.k = parseInt(e.target.value, 10);
		$('kValue').textContent = state.k;
	});

	$('mode-view').addEventListener('click', () => setCanvasMode('view'));
	$('mode-edit').addEventListener('click', () => setCanvasMode('add'));
	$('mode-drag').addEventListener('click', () => setCanvasMode('drag'));
	$('mode-delete').addEventListener('click', () => setCanvasMode('delete'));

	$('btn-random').addEventListener('click', () => { 
		saveHistory();
		state.points = setRandomPreset(Math.floor(Math.random() * 16));
		setPrimaryButton('rand');
		drawAndStats(); 
	});

	$('btn-k-out').addEventListener('click', () => {
		setPrimaryButton('k-out');
		if (state.polygons.length == 0 && state.hull != null) {
			state.polygons = enumarator.enumerateAtMostKOutPolygons(state.points, state.k);
			state.idx = 0;
		} else { state.idx = (state.idx + 1) % state.polygons.length; }
		drawAndStats();
	});

	$('btn-undo').addEventListener('click', () => { 
		setPrimaryButton('undo');
		undo(); 
	});

	$('btn-redo').addEventListener('click', () => { 
		setPrimaryButton('redo');
		redo(); 
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

	$('in-out-pts').addEventListener('change', (e) => {
		state.showInOutPoints = e.target.checked;
		drawAndStats();
	});
});

function setPrimaryButton(button) {
	for (const elem of document.querySelectorAll('.btn')) {
		elem.classList.remove('primary');
	}

	if (button == 'rand') $('btn-random').classList.add('primary');
	else if (button == 'k-out') $('btn-k-out').classList.add('primary');
	else if (button == 'undo') $('btn-undo').classList.add('primary');  
	else if (button == 'redo') $('btn-redo').classList.add('primary');
	else if (button == 'clear') $('btn-clear').classList.add('primary');
}

function setCanvasMode(mode) {
	state.mode = mode;
	for (const elem of document.querySelectorAll('.seg-btn')) {
		elem.classList.remove('active');
	}

	if (mode == 'view') { $('mode-view').classList.add('active'); }
	else if (mode == 'add') { $('mode-edit').classList.add('active'); }
	else if (mode == 'drag') { $('mode-drag').classList.add('active'); }  
	else if (mode == 'delete') { $('mode-delete').classList.add('active'); }
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
	draw();
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
		
		if (state.showInOutPoints) {
			if (state.inside.includes(p)) {
				fill(0, 255, 0, 150);
				p.draw();
			} else if (state.outside.includes(p)) {
				fill(255, 0, 0, 150);
				p.draw();
			}
		}
		idx++;
	}

	if (state.idx >= 0) {
		stroke(125, 50,240);
		strokeWeight(2);
		noFill();
		geometry.drawPolygon(state.polygons[state.idx]);
	}

	strokeWeight(1);
	noStroke();
}

function mousePressed() {
	const insideCanvas = mouseX >= 0 && mouseX <= width 
	&& mouseY >= 0 && mouseY <= height;
	if (!insideCanvas) return;
	if (state.mode != 'view') {
		state.polygons = [];
		state.idx = -1;
	}
	if (state.mode == 'add') {
		saveHistory();
		state.points.push(new geometry.Point(mouseX, mouseY));
		state.points = geometry.generalPosition(state.points);
		drawAndStats();
	} else if (state.mode == 'drag' && dragIndex == -1) {
		dragIndex = findNearestPoint(mouseX, mouseY);
	} else if (state.mode == 'delete') {
		saveHistory();
		const idx = findNearestPoint(mouseX, mouseY);
		if (idx != -1) {
			state.points.splice(idx, 1);
			drawAndStats();
		}
	}
}

function mouseDragged() {
	if (state.mode != 'view') {
		state.polygons = [];
		state.idx = -1;
	}
	if (state.mode == 'drag' && dragIndex != -1) {
		state.points[dragIndex].x = mouseX;
		state.points[dragIndex].y = mouseY;
		drawAndStats();
	}
}

function mouseReleased() {
	if (state.mode == 'drag' && dragIndex != -1) {
		saveHistory()
		dragIndex = -1;
		state.points = geometry.sortPoints(state.points);
		drawAndStats();
	}
}

function updateStats() {
	$('stat-n').textContent = state.points.length;
	$('stat-p').textContent = state.polygons.length;

	if (state.points.length >= 3) {
		let polygon = null;
		state.hull = geometry.convexHullGrahamScan(state.points);
		if (state.idx > -1) { polygon = state.polygons[state.idx]; } 
		else { polygon = state.hull; }
		state.inside = geometry.insideOutsidePoints(state.points, polygon);
		state.outside = geometry.insideOutsidePoints(state.points, polygon, false);
	} else { 
		state.hull = []; 
		state.inside = [];
		state.outside = [];
	}
	$('stat-h').textContent = state.hull.length;
	$('stat-in').textContent = state.inside.length;
	$('stat-out').textContent = state.outside.length;

	if (state.showLabels && state.points.length > 0 && state.mode != 'drag') {
		if (state.hull.length == 0) return;
		state.hull = state.hull;
		const rest = state.points.filter((p) => !state.hull.includes(p));
		state.points = state.hull.concat(rest);
	}
}

function drawAndStats() {
	updateStats();
	redraw();
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