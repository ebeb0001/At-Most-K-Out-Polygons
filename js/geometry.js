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

export function cmp(p_i, q_j, points) {
	const i = points.indexOf(p_i);
	const j = points.indexOf(q_j);
	return i < j;
}

export function succ(p, points) {
	const idx = points.indexOf(p);
	return points[(idx + 1) % points.length];
}

export function pred(p, points) {
	const idx = points.indexOf(p);
	return points[(idx - 1 + points.length) % points.length];
}

export function isEmbeddable(p_i, polygon, outsidePoints) {
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
	if (isLeftTurn(orient(pred_p_i, p_i, succ_p_i))) { return false; }

	// console.log(outsidePoints);
	for (const q of outsidePoints) {
		const orient1 = orient(pred_p_i, succ_p_i, q);
		const orient2 = orient(succ_p_i, p_i, q);
		const orient3 = orient(p_i, pred_p_i, q);
		if (isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function embedPoint(polygon, p_i) {
	return polygon.filter((p) => p !== p_i);
}

export function isInsertable(p, idx, polygon, outsidePoints) {
	const p_i = polygon[idx];
	const succ_p_i = succ(p_i, polygon);
	console.log(p, p_i, succ_p_i);
	if (isLeftTurn(orient(p, p_i, succ_p_i))) { return false; }

	for (const q of outsidePoints) {
		const orient1 = orient(p_i, p, q);
		const orient2 = orient(p, succ_p_i, q);
		const orient3 = orient(succ_p_i, p_i, q);
		if (isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function insertPoint(polygon, p, idx) {
	// console.log(polygon);
	const new_polygon = polygon.toSpliced(idx + 1, 0, p);
	// console.log(new_polygon);
	return new_polygon;
}

export function dist(p_i, p, polygon) {
	const succ_p_i = succ(p_i, polygon);
	const middle_point = new Point(p_i.x + ((succ_p_i.x - p_i.x) / 2), p_i.y + ((succ_p_i.y - p_i.y) / 2));
	return euclidianDist(middle_point, p);
}

export function cloe(p, polygon, outsidePoints) { 
	let min_dist = Infinity;
	let min_q = null;
	for (let i = 0; i < polygon.length; i++) {
		console.log(p, i, polygon, outsidePoints);
		if (isInsertable(p, i, polygon, outsidePoints)) {
			const q = polygon[i];
			const distance = dist(q, p, polygon);
			if (distance < min_dist) { 
				min_dist = distance;
				min_q = q;
			} else {
				const size_edge_1 = euclidianDist(min_q, succ(min_q, polygon));
				const size_edge_2 = euclidianDist(q, succ(q, polygon));
				if (size_edge_2 < size_edge_1) {
					min_dist = distance;
					min_q = q;
				}
			}
		}
	}
	return min_q;
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
	let min_p = null;
	for (const p of outsidePoints) {
		const q = cloe(p, polygon, outsidePoints);
		const distance = dist(q, p, polygon);
		if (distance < min_dist) { min_p = p; }
	}
	return min_p;
}

export function larg(polygon, outsidePoints) {
	console.log("outside points lag", outsidePoints);
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
	console.log("outside points par", outsidePoints);
	const p = larg(polygon, outsidePoints);
	if (p == null) { 
		const closest_outside_point = clop(polygon, outsidePoints);
		const closest_edge = cloe(closest_outside_point, polygon, outsidePoints);
		return insertPoint(polygon, closest_outside_point, polygon.indexOf(closest_edge));
	} else { return embedPoint(polygon, p); }
}

export function isDigable(p_i, p, polygon, points) {
	const succ_p_i = succ(p_i, polygon);
	if (isLeftTurn(orient(p_i, p, succ_p_i))) { return false; }

	for (const point of points) {
		const orient1 = orient(p_i, succ_p_i, point);
		const orient2 = orient(succ_p_i, p, point);
		const orient3 = orient(p, p_i, point);
		if (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function dig(p_i, p, polygon) {
	return insertPoint(polygon, p, polygon.indexOf(p_i));
}

export function isRemovable(p_i, polygon, outsidePoints, points, k) {
	console.log("outside points is removable", outsidePoints);
	if (outsidePoints != null && outsidePoints.length >= k) { return false; }
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
	if (isRightTurn(orient(pred_p_i, p_i, succ_p_i))) { return false; }

	for (const point of points) {
		const orient1 = orient(pred_p_i, succ_p_i, point);
		const orient2 = orient(succ_p_i, p_i, point);
		const orient3 = orient(p_i, pred_p_i, point);
		if (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3)) {
			return false;
		}
	}
	return true;
}

export function rmv(polygon, p_i, outsidePoints, points, k) {
	// console.log(points);
	if (isRemovable(p_i, polygon, outsidePoints, points, k)) {
		return embedPoint(polygon, p_i);
	}
}

export function isActive(p_i, p, p_j, polygon, outsidePoints, points, k) {
	// console.log(p_i);
	// console.log(p);
	// console.log(p_j);
	// console.log(polygon);
	console.log("outside point is active", outsidePoints);
	// console.log(points);
	// console.log(k);
	if (p_i == null && p == null) { 
		return par(rmv(polygon, p_j, outsidePoints, points, k), outsidePoints) === polygon; 
	}
	if (p_j == null) { return par(dig(p_i, p, polygon), outsidePoints) === polygon; }
}

export function embeddableVertices(polygon, outsidePoints) {
	let embeddable_points = [];
	for (const p of polygon) {
		if (isEmbeddable(p, polygon, outsidePoints)) {
			embeddable_points.push(p);
		}
	}
	return embeddable_points;
}

// drawing functions

export function drawPolygon(points) {
	beginShape();
	for (const p of points) {
		vertex(p.x, p.y);
	}
	endShape(CLOSE);
}