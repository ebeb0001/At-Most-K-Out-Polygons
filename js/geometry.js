// classes

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

// base functions 

export function orient(A, B, C) {
	const det = (B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x);
	return det;
}

export function isLeftTurn(orient_det) { return orient_det < 0; }

export function isRightTurn(orient_det) { return orient_det > 0; }

export function euclidianDist(p, q) {
	return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

export function sortPoints(points) {
	let p0 = points[0];
	for (let i = 1; i < points.length; i++) {
		if (points[i].x < p0.x || (points[i].x === p0.x && points[i].y > p0.y)) {
		p0 = points[i];
		}
	}
	const rest = points.filter((p) => p !== p0);
	rest.sort((p, q) => {
		const orient_p = orient(p0, p, q);
		if (orient_p !== 0) { return -orient_p; }
		return euclidianDist(p0, p) - euclidianDist(p0, q);
	}).reverse();
	return [p0, ...rest];
}

export function insideOutsidePoints(points, polygon, insidePoints = true) {
	const result = [];
	for (const p of points) {
		let isInside = true;
		if (!polygon.includes(p)) {
			for (let i = 0; i < polygon.length; i++) {
				const A = polygon[i];
				const B = polygon[(i + 1) % polygon.length];
				if (isRightTurn(orient(A, B, p))) {
					isInside = false;
					break;
				}
			}
			if ((insidePoints && isInside) 
			|| (!insidePoints && !isInside)) { result.push(p); }
		}
	}
	return result;
}

export function convexHullGrahamScan(points) {
	points = sortPoints(points);
	var hull = [];

	for (const p of points) {
		while (hull.length >= 2 &&
		isRightTurn(orient(hull[hull.length - 2], hull[hull.length - 1], p))) {
			hull.pop();
		}
		hull.push(p);
	}
	return hull;
}

// function from paper

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

export function isEmbeddable(p, polygon, outsidePoints) {
	const pred_p = pred(p, polygon);
	const succ_p = succ(p, polygon);
	if (isLeftTurn(orient(pred_p, p, succ_p))) { return false; }

	for (const q of outsidePoints) {
		const orient1 = orient(pred_p, succ_p, q);
		const orient2 = orient(succ_p, p, q);
		const orient3 = orient(p, pred_p, q);
		if (isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function embedPoint(polygon, point) {
	return polygon.filter((p) => p !== point);
}

export function isInsertable(q, idx, polygon, outsidePoints) {
	const p = polygon[idx];
	const succ_p = succ(p, polygon);
	if (isLeftTurn(orient(q, p, succ_p))) { return false; }

	for (const point of outsidePoints) {
		const orient1 = orient(p, q, point);
		const orient2 = orient(q, succ_p, point);
		const orient3 = orient(succ_p, p, point);
		if (isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function insertPoint(polygon, p, idx) {
	polygon.splice(idx + 1, 0, p);
	return polygon;
}

export function dist(p, q, polygon) {
	const succ_p = succ(p, polygon);
	const point = new Point(p.x + ((succ_p.x - p.x) / 2), p.y + ((succ_p.y - p.y) / 2));
	return euclidianDist(point, q);
}

export function cloe(q, polygon, outsidePoints) {
	let min_dist = Infinity;
	let min_p = null;
	for (let i = 0; i < polygon.length; i++) {
		if (isInsertable(q, i, polygon, outsidePoints)) {
			const p = polygon[i];
			const distance = dist(p, q, polygon);
			if (distance < min_dist) { 
				min_dist = distance;
				min_p = p;
			} else {
				const size_edge_1 = euclidianDist(min_p, succ(min_p, polygon));
				const size_edge_2 = euclidianDist(p, succ(p, polygon));
				if (size_edge_2 < size_edge_1) {
					min_dist = distance;
					min_p = p;
				}
			}
		}
	}
	return min_p;
}

export function insertablePoints(polygon, outsidePoints) {
	let insertable_points = [];
	for (const p of outsidePoints) {
		let i = 0;
		let is_insertable = false;
		while (!is_insertable && i < polygon.length) {
			if (isInsertable(p, i, polygon, outsidePoints)) {
				is_insertable = true;
			}
		}
		if (is_insertable) { insertable_points.push(p); }
	}
	return insertable_points;
}

export function clop(polygon, outsidePoints) {
	let min_dist = Infinity;
	let min_q = null;
	for (const q of outsidePoints) {
		const p = cloe(q, polygon, outsidePoints);
		const distance = dist(p, q, polygon);
		if (distance < min_dist) { min_q = q; }
	}
	return q;
}

export function larg(polygon, outsidePoints) {
	let largest_p = null;
	polygon = sortPoints(polygon);
	for (const p of polygon) {
		if (isEmbeddable(p, polygon, outsidePoints)) {
			largest_p = p;
		}
	}
	return largest_p;
}

export function par(polygon, outsidePoints) {
	const p = larg(polygon, outsidePoints);
	if (p) { return embedPoint(polygon, p); } 
	else {
		const closest_outside_point = clop(polygon, outsidePoints);
		const closest_edge = cloe(closest_outside_point, polygon, outsidePoints);
		return insertPoint(polygon, closest_outside_point, polygon.indexOf(closest_edge));
	}
}

export function isDigable(p, q, polygon, points) {
	const succ_p = succ(p, polygon);
	if (isLeftTurn(orient(p, q, succ_p))) { return false; }

	for (const point of points) {
		const orient1 = orient(p, succ_p, point);
		const orient2 = orient(succ_p, q, point);
		const orient3 = orient(q, p, point);
		if (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function dig(p, q, polygon) {
	return insertPoint(polygon, q, polygon.indexOf(p));
}

export function isRemovable(p, polygon, outsidePoints, points, k) {
	if (outsidePoints.length >= k) { return false; }
	const pred_p = pred(p, polygon);
	const succ_p = succ(p, polygon);
	if (isRightTurn(orient(pred_p, p, succ_p))) { return false; }

	for (const point of points) {
		const orient1 = orient(pred_p, succ_p, point);
		const orient2 = orient(succ_p, p, point);
		const orient3 = orient(p, pred_p, point);
		if (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3)) {
			return false;
		}
	}
}

export function rmv(polygon, p) {
	return embedPoint(polygon, p)
}

export function isActive(p, q, r, polygon) {
	return ((par(dig(p, q, polygon)) === polygon) 
	&& (par(rmv(polygon, r)))); 
}

// drawing functions

export function drawPolygon(points) {
	beginShape();
	for (const p of points) {
		vertex(p.x, p.y);
	}
	endShape(CLOSE);
}