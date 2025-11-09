export class Point {
	constructor(x, y, radius = 8) {
		this.x = x;
		this.y = y;
		this.radius = radius;
	}

	draw() {
		circle(this.x, this.y, this.radius);
	}
}

export function drawPolygon(points) {
	beginShape();
	for (const p of points) {
		vertex(p.x, p.y);
	}
	endShape(CLOSE);
}

export function orient(A, B, C) {
	const det = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
	return det;
}

export function isLeftTurn(orient_det) { return orient_det < 0; }

export function isRightTurn(orient_det) { return orient_det > 0; }

export function dist(p, q) {
	return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

export function cmp(p, q, points) {
	id_p = points.indexOf(p);
	id_q = points.indexOf(q);
	return id_p < id_q;
}

export function succ(p, points) {
	const idx = points.indexOf(p);
	return points[(idx + 1) % points.length];
}

export function pred(p, points) {
	const idx = points.indexOf(p);
	return points[(idx - 1) % points.length];
}

export function sortPoints(points) {
	points = points.slice().sort((p, q) => (p.y - q.y || p.x - q.x));
	const p0 = points[0];
	const rest = points.filter((p) => p !== p0);
	rest.sort((p, q) => {
		const orient_p = orient(p0, p, q);
		if (orient_p !== 0) { return -orient_p; }
		return dist(p0, p) - dist(p0, q);
	});
	return [p0, ...rest];
}

export function insidePoints(points, polygon) {
	const inside = [];
	for (const p of points) {
		let isInside = true;
		if (!polygon.includes(p)) {
			for (let i = 0; i < polygon.length; i++) {
				const A = polygon[i];
				const B = polygon[(i + 1) % polygon.length];
				if (isLeftTurn(orient(A, B, p))) {
					isInside = false;
					break;
				}
			}
			if (isInside) { inside.push(p); }
		}
	}
	return inside;
}

export function outsidePoints(points, polygon) {
	const outside = [];
	for (const p of points) {
		let isInside = true;
		if (!polygon.includes(p)) {
			for (let i = 0; i < polygon.length; i++) {
				const A = polygon[i];
				const B = polygon[(i + 1) % polygon.length];
				if (isLeftTurn(orient(A, B, p))) {
					isInside = false;
					break;
				}
			}
			if (!isInside) { outside.push(p); }
		}
	}
	return outside;
}

export function convexHullGrahamScan(points) {
	points = sortPoints(points);
	var hull = [];

	for (const p of points) {
		while (hull.length >= 2 &&
		isLeftTurn(orient(hull[hull.length - 2], hull[hull.length - 1], p))) {
			hull.pop();
		}
		hull.push(p);
	}
	return hull;
}