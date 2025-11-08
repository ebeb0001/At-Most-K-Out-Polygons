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

// export class Triangle {
// 	constructor(a, b, c) {
// 		this.a = a;
// 		this.b = b;
// 		this.c = c;
// 	}

// 	orientVerification(o1, o2) {
// 		return (
// 			(isLeftTurn(o1) && isLeftTurn(o2)) || 
// 			(isRightTurn(o1) && isRightTurn(o2))
// 		);
// 	}

// 	isInside(p) {
// 		var orient_ab = orient(this.a, this.b, p);
// 		var orient_bc = orient(this.b, this.c, p);
// 		var orient_ac = orient(this.c, this.a, p);
// 		return (
// 			this.orientVerification(orient_ab, orient_bc) &&
// 			this.orientVerification(orient_bc, orient_ac) &&
// 			this.orientVerification(orient_ac, orient_ab)
// 		);
// 	}
// }

export function orient(A, B, C) {
	const det = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
	return det;
}

export function isLeftTurn(orient_det) { return orient_det < 0; }

export function isRightTurn(orient_det) { return orient_det > 0; }

export function dist(p, q) {
	return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
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