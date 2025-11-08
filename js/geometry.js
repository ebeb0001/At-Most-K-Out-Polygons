export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

export class Polygon {
	constructor(points) {
		this.points = points;
		this.sortPoints();
	}

	nb_points() {
		return this.points.length;
	}

	get_point(i) {
		if (i < this.nb_points()) {
			return this.points[i];
		}
	}

	sortPoints() {
		let p0 = this.points[0];
		for (let i = 1; i < this.points.length; i++) {
			if (this.points[i].x < p0.x || 
			(this.points[i].x === p0.x && this.points[i].y > p0.y)) {
			p0 = this.points[i];
			}
		}

		const rest = this.points.filter((p) => p !== p0);
		rest.sort(cmpDist.bind(null, p0));

		return [p0, ...rest];
	}

	index(p) {
		return this.points.findIndex((q) => q.x === p.x && q.y === p.y);
	}
}

export class Triangle {
	constructor(a, b, c) {
		this.a = a;
		this.b = b;
		this.c = c;
	}

	orientVerification(o1, o2) {
		return (
			(isLeftTurn(o1) && isLeftTurn(o2)) || 
			(isRightTurn(o1) && isRightTurn(o2))
		);
	}

	isInside(p) {
		var orient_ab = orient(this.a, this.b, p);
		var orient_bc = orient(this.b, this.c, p);
		var orient_ac = orient(this.c, this.a, p);
		return (
			this.orientVerification(orient_ab, orient_bc) &&
			this.orientVerification(orient_bc, orient_ac) &&
			this.orientVerification(orient_ac, orient_ab)
		);
	}
}

export function orient(A, B, C) {
	const det = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
	return det;
}

export function isLeftTurn(orient_det) { return orient_det < 0; }

export function isRightTurn(orient_det) { return orient_det > 0; }

export function dist(p1, p2) {
	const distance = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
	return distance;
}

export function cmpDist(p, p1, p2) {
	const orientation = orient(p, p1, p2);
	if (orientation > 0) { return -1;} 
	else if (orientation < 0) { return 1; }

	dist_p_p1 = dist(p, p1);
	dist_p_p2 = dist(p, p2);

	if (dist_p_p1 > dist_p_p2) { return -1; } 
	else if (dist_p_p1 < dist_p_p2) { return 1; } 
	else { return 0; }
}

export function convexHullGrahamScan(polygon) {
	p0 = polygon.get_point(0);
	var hull = [];

	for (p of polygon.points) {
		while (hull.length >= 2 &&
		orient(hull[hull.length - 2], hull[hull.length - 1], p) <= 0) {
			hull.pop();
		}
		hull.push(p);
	}
	return new Polygon(hull);
}