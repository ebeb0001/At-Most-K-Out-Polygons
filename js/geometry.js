// classes

export class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	draw() {
		circle(this.x, this.y, 8);
	}
}

// base functions 

export function orient(A, B, C) {
	return -((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x));
}

export function isLeftTurn(orient_det) { return orient_det > 0; }

export function isRightTurn(orient_det) { return orient_det < 0; }

export function euclidianDist(p, q) {
	return Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2);
}

export function sortPoints(points) {
	let p0 = points[0];
	for (let i = 1; i < points.length; i++) {
		if (points[i].x < p0.x || (points[i].x === p0.x && points[i].y < p0.y)) {
		p0 = points[i];
		}
	}
	const rest = points.filter((p) => p !== p0).sort((p, q) => {
		const orient_p = orient(p0, p, q);
		if (isLeftTurn(orient_p)) { return -1; }
		if (isRightTurn(orient_p)) { return 1; }
		return euclidianDist(p0, p) - euclidianDist(p0, q);
	});
	return [p0, ...rest];
}

export function isInsidePolygon(p, polygon) {
	const line = p.y;
	let nb_intersection = 0;
	let intersections = [];
	for (const q of polygon) {
		const succ_q = succ(q, polygon);
		if ((q.y <= line && succ_q.y >= line) 
		|| (q.y >= line && succ_q.y <= line)) {
			intersections.push(q);
		} 
	}
	for (const q of intersections) {
		const succ_q = succ(q, polygon);
		const above = q.y >= succ_q.y ? q : succ_q;
		const under = q.y <= succ_q.y ? q : succ_q;
		if (isLeftTurn(orient(above, under, p))) { nb_intersection++; }
	}
	return nb_intersection % 2 === 1;
}

export function insideOutsidePoints(points, polygon, insidePoints = true) {
	const result = [];
	const rest = points.filter((p) => !polygon.includes(p));
	for (const p of rest) {
		const isInside = isInsidePolygon(p, polygon);
		if ((isInside && insidePoints) 
		|| (!isInside && !insidePoints)) { result.push(p); }

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

export function pointInTriangle(a, b, c, p) {
	const orient1 = orient(a, b, p); 
	const orient2 = orient(b, c, p);
	const orient3 = orient(c, a, p);
	if ((isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) 
	|| (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3))) {
		return true;
	}
	return false;
}

export function segmentIntersect(a, b, u, v) {
	const orient1 = orient(u, v, a); 
	const orient2 = orient(u, v, b);
	if ((isLeftTurn(orient1) && isRightTurn(orient2)) 
	|| (isRightTurn(orient1) && isLeftTurn(orient2))) { 
		const orient3 = orient(a, b, u);
		const orient4 = orient(a, b, v);
		if ((isLeftTurn(orient3) && isRightTurn(orient4)) 
		|| (isRightTurn(orient3) && isLeftTurn(orient4))) { return true; } 
	}
	return false;
}

export function segmentHitsPolygon(u, v, polygon) {
	for (let i = 0; i < polygon.length; i++) {
		const p = polygon[i];
		const succ_p = succ(p, polygon);
		let verifiable = true;
		if ((p === u || p === v) || (succ_p === u || succ_p === v)) { verifiable = false; }
		if (verifiable && segmentIntersect(p, succ_p, u, v)) { return true; }
	}
	return false;
}

export function isPolygon(polygon, P) {
	console.log("checking if the two polygons are the same", polygon, P);
	for (const point of polygon) {
		if (!P.includes(point)) { 
			console.log("not the same", point);
			return false; 
		}
	}
	console.log("same");
	return true;
}

// function from paper

export function cmp(p_i, p_j, points) {
// 	We denote by pi ≺ pj if i < j holds, and we say that pj is larger than pi on P

	const i = points.indexOf(p_i);
	const j = points.indexOf(p_j);
	return i < j;
}

export function succ(p_i, points) {
// succ(pi) denote the successor of pi of P. Note that the successor of pt is p1

	const idx = points.indexOf(p_i);
	return points[(idx + 1) % points.length];
}

export function pred(p_i, points) {
// pred(pi)  denote the predecessor of pi of P

	const idx = points.indexOf(p_i);
	return points[(idx - 1 + points.length) % points.length];
}

export function isEmbeddable(p_i, polygon, outsidePoints) {
// A vertex pi of P is embeddable if the triangle consisting of pred(pi), pi, 
// and succ(pi) does not intersect the interior of P and includes no point in out(P).
	
	console.log("checking embeddability of point ", p_i);
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
	// console.log(pred_p_i);
	// console.log(p_i);
	// console.log(succ_p_i);
	// console.log(orient(pred_p_i, p_i, succ_p_i));
	if (isLeftTurn(orient(pred_p_i, p_i, succ_p_i))) { 
		console.log("not embeddable 1");
		return false; 
	}

	if (segmentHitsPolygon(pred_p_i, succ_p_i, polygon)) {
		console.log("not embeddable 2");
		return false;
	}

	for (const q of outsidePoints) {
		if (pointInTriangle(pred_p_i, succ_p_i, p_i, q)) {
			console.log("not embeddable 3");
			return false;
		}
	}
	console.log("embeddable");
	return true;
}

export function embedPoint(polygon, p_i) {
// An embedment of an embeddable vertex pi of P is to remove two edges (pred(pi), pi) and (pi,succ(pi)) 
// and insert the edge (pred(pi),succ(pi)). We denote by emb(P, pi) the simple polygon obtained from P 
// by applying the embedment of pi to P

	// return sortPoints(polygon.filter((p) => p !== p_i));
	return polygon.filter((p) => p !== p_i);
}

export function isInsertable(p, idx, polygon, outsidePoints) {
// A point p ∈ out(P) is insertable to an edge (pi,succ(pi)) of P 
// if the triangle consisting of p, pi, and succ(pi) does not intersect the interior of P 
// and includes no point in out(P). 

	console.log("checking insertability of point ", p);
	const p_i = polygon[idx];
	const succ_p_i = succ(p_i, polygon);
	if (isRightTurn(orient(p_i, p, succ_p_i))) { 
		console.log("not insertable 1");
		return false; 
	}

	if (segmentHitsPolygon(p_i, p, polygon)) {
		console.log("not insertable 2");
		return false;
	}

	if (segmentHitsPolygon(p, succ_p_i, polygon)) {
		console.log("not insertable 3");
		return false;
	}

	const rest = outsidePoints.filter((p_i) => p_i !== p);
	for (const q of rest) {
		if (pointInTriangle(p_i, p, succ_p_i, q)) {
			console.log("not insertable 4");
			return false;
		}
	}
	console.log("insertable");
	return true;
}

export function insertPoint(polygon, p, idx) {
// For a point p ∈ out(P) insertable to an edge (pi,succ(pi)) of P, the insertion of p 
// to (pi,succ(pi)) is to remove (pi,succ(pi)) and insert the two edges (pi, p) and (p,succ(pi)). 
// We denote by ins(P,(pi,succ(pi)), p) the simple polygon obtained from P 
// by applying the insertion of p to (pi,succ(pi)) on P.

	const new_polygon = polygon.toSpliced(idx + 1, 0, p);
	return new_polygon;
}

export function dist(p_i, p, polygon) {
// we define the distance of (pi ,succ(pi)) from p as the Euclidean distance between 
// the midpoint of (pi ,succ(pi)) and p. The distance from p to (pi ,succ(pi)) is denoted 
// by dist((pi ,succ(pi)), p). Note that, if p is not insertable to an edge (pi ,succ(pi)), 
// the distance from p to (pi ,succ(pi)) is not defined

	const succ_p_i = succ(p_i, polygon);
	const middle_point = new Point(p_i.x + ((succ_p_i.x - p_i.x) / 2), p_i.y + ((succ_p_i.y - p_i.y) / 2));
	return euclidianDist(middle_point, p);
}

export function cloe(p, polygon, outsidePoints) {
// We denote the closest edge of P among the edges insertable from p by
// cloe(P, p). If ties exist, the largest edge is cloe(P, p).

	console.log("searching for the closest edge to point ", p);
	// polygon = sortPoints(polygon);
	let min_dist = Infinity;
	let min_q = null;
	for (let i = 0; i < polygon.length; i++) {
		if (isInsertable(p, i, polygon, outsidePoints)) {
			const q = polygon[i];
			const distance = dist(q, p, polygon);
			console.log(distance);
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
	console.log("min_q", min_q);
	return min_q;
}

export function insertablePoints(polygon, outsidePoints) {
// We denote the set of the points insertable to at least one edge of P by iout(P) ⊆ out(P).

	console.log("computing the insertable points");
	let insertable_points = [];
	for (const p of outsidePoints) {
		let i = 0;
		let is_insertable = false;
		while (!is_insertable && i < polygon.length) {
			if (isInsertable(p, i, polygon, outsidePoints)) {
				is_insertable = true;
			}
			i++;
		}
		if (is_insertable) { insertable_points.push(p); }
	}
	console.log("insertable points ", insertable_points);
	return insertable_points;
}

export function clop(polygon, outsidePoints) {	
// A point p ∈ iout(P) is the closest outside point, denoted by clop(P), of P if
// dist(cloe(P, p), p) = min q∈iout(P) {dist(cloe(P, q), q)}

	console.log("searching the closest outside point");
	let min_dist = Infinity;
	let min_p = null;
	for (const p of outsidePoints) {
		const q = cloe(p, polygon, outsidePoints);
		const distance = dist(q, p, polygon);
		if ((distance < min_dist) 
		|| (distance === min_dist && (p.x > min_p.x && p.y > min_p.y))) { 
			min_p = p; 
			min_dist = distance;
		}
	}
	console.log("min_p", min_p);
	return min_p;
}

export function larg(polygon, outsidePoints) {
// We denote by larg(P) the largest embeddable vertex of P. For convenience, we define
// larg(P) := ∅ if P has no embeddable vertex.

	console.log("seaching for the largest embeddable vertex of polygon ", polygon);
	let largest_p = null;
	for (const p of polygon) {
		if (isEmbeddable(p, polygon, outsidePoints)) {
			if (largest_p == null || cmp(largest_p, p, polygon)) {
				largest_p = p;
			}
		}
	}
	console.log("largest p", largest_p);
	return largest_p;
}

export function par(polygon, outsidePoints, points) {
// we define the parent of P as follows:
// par(P) :=
// emb(P, larg(P)) if P has an embeddable vertex,
// ins(P, cloe(P, clop(P)), clop(P)) otherwise.

	if (polygon != null) {
		console.log("computing the parent of polygon ", polygon);
		outsidePoints = insideOutsidePoints(points, polygon, false);
		const p = larg(polygon, outsidePoints);
		let parent = null;
		if (p == null) { 
			const closest_outside_point = clop(polygon, outsidePoints);
			const closest_edge = cloe(closest_outside_point, polygon, outsidePoints);
			parent = insertPoint(polygon, closest_outside_point, polygon.indexOf(closest_edge));
		} else { parent = embedPoint(polygon, p); }
		console.log("parent", parent);
		// return sortPoints(parent);
		return parent;
	}
}

export function isDigable(p_i, p, polygon, points) {
// A pair (pi, p) of a vertex pi of P and a point p ∈ in(P) is digable 
// if the triangle consisting of pi, p, and succ(pi) lies inside P and 
// does not contain any point of S.

	const succ_p_i = succ(p_i, polygon);
	console.log("checking the digability of pair", p_i, p);
	if (isLeftTurn(orient(p_i, p, succ_p_i))) {
		console.log("not digable 1");
		return false; 
	}

	if (segmentHitsPolygon(p_i, p, polygon)) {
		console.log("not digable 2");
		return false;
	}

	if (segmentHitsPolygon(p, succ_p_i, polygon)) {
		console.log("not digable 3");
		return false;
	}

	const rest = points.filter((q) => q !== p_i && q !== p_i && q !== succ_p_i);
	for (const q of rest) {
		if (pointInTriangle(p_i, p, succ_p_i, q)) {
			console.log("not digable 4");
			return false;
		}
	}
	console.log("digable");
	return true;
}

export function dig(p_i, p, polygon, points) {
// A dig operation to a digable pair (pi, p) removes the edge (pi ,succ(pi)) 
// and inserts the two edges (pi, p) and (p,succ(pi)). 
// dig(P, pi, p) denotes the resulting polygon.

	// console.log("point set", points);
	if (isDigable(p_i, p, polygon, points)) {
		console.log("dig operation for point", p_i);
		return insertPoint(polygon, p, polygon.indexOf(p_i));
	}
	// return polygon;
}

export function isRemovable(p_i, polygon, outsidePoints, points, k) {
// A vertex pi of P is removable if (1) |out(P)| < k holds, (2) the triangle consisting of pred(pi), pi, 
// and succ(pi) lies inside P, and (3) the triangle does not contain any point of S.

	console.log("checking the removability of point", p_i);
	if (outsidePoints != null && outsidePoints.length >= k) { 
		console.log("not removable 1");
		return false; 
	}
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
	if (isLeftTurn(orient(pred_p_i, p_i, succ_p_i))) { 
		console.log("not removable 2");
		return false; 
	}

	if (segmentHitsPolygon(pred_p_i, succ_p_i, polygon)) {
		console.log("not removable 3");
		return false;
	}

	const rest = points.filter((q) => q !== p_i && q !== p_i && q !== succ_p_i);
	for (const q of rest) {
		if (pointInTriangle(pred_p_i, succ_p_i, p_i, q)) {
			console.log("not embeddable 3");
			return false;
		}
	}
	console.log("removable");
	return true;
}

export function rmv(polygon, p_i, outsidePoints, points, k) {
// A remove operation to a removable vertex pi removes the two edges (pred(pi), pi) 
// and (pi ,succ(pi)), and inserts an edge (pred(pi),succ(pi)) to P. 
// rmv(P, pi) denotes the resulting polygon.

	if (isRemovable(p_i, polygon, outsidePoints, points, k)) {
		console.log("remove operation for point", p_i);
		return embedPoint(polygon, p_i);
	}
	// return polygon;	
}

export function isActive(p_i, p, p_j, polygon, outsidePoints, points, k) {
// We say that a digable pair (pi , p) and a removable vertex pj are active 
// if dig(P, pi , p) and rmv(P, pj ) are children of P, respectively. 

	let activity = true;
	let parent = null;
	if (p_i == null && p == null) { 
		console.log("checking the activity of point", p_j);
		parent = par(rmv(polygon, p_j, outsidePoints, points, k), outsidePoints, points);
	} else if (p_j == null) { 
		console.log("checking the activity of pair", p_i, p);
		parent = par(dig(p_i, p, polygon, points), outsidePoints, points); 
	}
	if (parent == null || parent.length !== polygon.length) { activity = false; }
	else { activity = isPolygon(parent, polygon); } 
	activity ? console.log("active") : console.log("not active");
	return activity;
}

export function embeddableVertices(polygon, outsidePoints) {
	console.log("computing the embeddable vertices of polygon", polygon);
	let embeddable_points = [];
	for (const p of polygon) {
		if (isEmbeddable(p, polygon, outsidePoints)) {
			embeddable_points.push(p);
		}
	}
	console.log("embeddable verticies", embeddable_points);
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