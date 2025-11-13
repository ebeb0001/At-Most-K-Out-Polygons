/**
 * Represents a point in 2D space/
 */
export class Point {
	/**
	 * Creates a new Point instance/
	 * 
	 * @param {number} x The x-coordinate of the point.
	 * @param {number} y The y-coordinate of the point.
	 */
	constructor(x, y) {
		/** @type {number} */
		this.x = x;
		/** @type {number} */
		this.y = y;
	}

	/**
	 *  Checks whether two points have the same coordinates.
	 * 
	 * @param {Point} p The point to test. 
	 * @returns {boolean} `true` if the point's x and y are equal (using ==) to the given point's coordinates,
	 * otherwise `false`.
	 */
	isSame(p) { return this.x == p.x && this.y == p.y; }

	/**
	 * Draws the point as a circle at its coordinates
	 * 
	 * @returns {void}
	 */
	draw() { circle(this.x, this.y, 8); }
}

// base functions 

/**
 * Computes the orientation determinant of three points. 
 * 
 * @param {Point} A The first point.
 * @param {Point} B The second point.
 * @param {Point} C The third point.
 * @returns {number} The signed orientation value of the points
 */
function orient(A, B, C) {
	return -((B.x - A.x) * (C.y - A.y) - (B.y - A.y) * (C.x - A.x));
}

/**
 * Determines whether the orientation determinant represents a right turn
 * 
 * @param {number} orient_det The orientation determinant.
 * @returns {boolean} `true` if the the orientation indicates a left turn (counter clockwise), 
 * otherwise `false`.
 */
function isLeftTurn(orient_det) { return orient_det > 0; }

/**
 * Determines whether the orientation determinant represents a right turn
 * 
 * @param {number} orient_det The orientation determinant.
 * @returns {boolean} `true` if the the orientation indicates a right turn (clockwise), 
 * otherwise `false`.
 */
function isRightTurn(orient_det) { return orient_det < 0; }

/**
 * Computes the Euclidean distance between two points.

 * @param {Point} p The first point.
 * @param {Point} q The second point.
 * @returns {number} The Euclidean distance between points `p` and `q`.
 */
function euclidianDist(p, q) {
	return Math.sqrt((p.x - q.x)**2 + (p.y - q.y)**2);
}

/**
 * Sorts an array in counterclockwise order around the lowest point.
 * 
 * @param {Array<Point>} points The array of points to sort.
 * @returns {Array<Point>} A new array of points sorted in counterclockwise order 
 * with respect to the pivot `p0`.
 */
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

/**
 * 	Tests whether a point lies inside a polygon using the even-odd ray-casting rule.
 * 
 * @param {Point} p The query point.
 * @param {Array<Point>} polygon Vertices of the polygon in counterclockwise order.
 * @returns {boolean} `true` if `p` is inside the polygon by the even-ood rulle, otherwise `false`.
 */
function isInsidePolygon(p, polygon) {
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

/**
 * Filters a set of points based on whether they lie inside or outside of a given polygon.
 * 
 * @param {Array<Point>} points The array of points to test.
 * @param {Array<Point>} polygon Vertices of the polyygon in counterclockwise order.
 * @param {boolean} insidePoints If `true`, returns only the points inside the polygon;
 * 
 * If `false`, returns only the points inside the polygon;
 * 
 * @returns {Array<Point>} The subset of points that are either inside or outside the polygon. 
 */
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

/**
 * Computes the convex hull of a set of points using the Graham Scan algorithm. 
 * 
 * @param {Array<Point>} points The input array of points.
 * @returns {Array<Point>} The points forming the convex hull, in counterclockwise order.
 */
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

/**
 * Determines whether a point lies inside a triangle using orientation tests.
 * 
 * @param {Point} a The first vertex of the triangle.
 * @param {Point} b The second vertex of the triangle.
 * @param {Point} c The third vertex of the triangle.
 * @param {Point} p The point to test.
 * @returns {boolean} `true` if the point lies inside the triangle or on the boundary 
 * of the triangle, otherwise `false`.
 */
function pointInTriangle(a, b, c, p) {
	const orient1 = orient(a, b, p); 
	const orient2 = orient(b, c, p);
	const orient3 = orient(c, a, p);
	if ((isLeftTurn(orient1) && isLeftTurn(orient2) && isLeftTurn(orient3)) 
	|| (isRightTurn(orient1) && isRightTurn(orient2) && isRightTurn(orient3))) {
		return true;
	}
	return false;
}

/**
 * Determines whether two line segments intersect using oreintation tests.
 * 
 * @param {Point} a The first endpoint of the first segment.
 * @param {Point} b The second endpoint of the first segment.
 * @param {Point} u The first endpoint of the second segment.
 * @param {Point} v The second endpoint of the second segment.
 * @returns {boolean} `true` if the two segments properly intersect, otherwise `false`.
 */
function segmentIntersect(a, b, u, v) {
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

/**
 * Checks whether a line segment intersect any edge of a polygon.
 * 
 * @param {Point} u First endpoint of the query segment.
 * @param {Point} v Secondd endpoint of the query segment.
 * @param {Array<Point>} polygon Vertices of the poltgon in counterclockwise order. 
 * @returns {boolean} `true` if (u -> u) properly intersects any polygon edge 
 * (excluding shared endpoints), otherwise `false`.
 */
function segmentHitsPolygon(u, v, polygon) {
	for (let i = 0; i < polygon.length; i++) {
		const p = polygon[i];
		const succ_p = succ(p, polygon);
		let verifiable = true;
		if ((p.isSame(u) || p.isSame(v)) || (succ_p.isSame(u) || succ_p.isSame(v))) { verifiable = false; }
		if (verifiable && segmentIntersect(p, succ_p, u, v)) { return true; }
	}
	return false;
}

/**
 * Checks whether two polygons are identical **vertex-by-vertex in the same order**.
 * 
 * @param {Array<Point>} polygon The first polygon to compare.
 * @param {Array<Point>} P The second polygon to compare.
 * @returns {boolean} `true` if both polygons have the same length and each 
 * `P[i]` is the same as `polygon[i]`, otherwise `false`.
 */
function isSamePolygon(polygon, P) {
	console.log("checking if the two polygons are the same", polygon, P);
	if (polygon.length !== P.length) {
		console.log("not the same");
		return false; 
	}

	for (let i = 0; i < P.length; i++) {
		if (!P[i].isSame(polygon[i])) { 
			console.log("not the same", polygon[i]);
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

function succ(p_i, points) {
// succ(pi) denote the successor of pi of P. Note that the successor of pt is p1

	const idx = points.indexOf(p_i);
	return points[(idx + 1) % points.length];
}

export function pred(p_i, points) {
// pred(pi)  denote the predecessor of pi of P

	const idx = points.indexOf(p_i);
	return points[(idx - 1 + points.length) % points.length];
}

function isEmbeddable(p_i, polygon, outsidePoints) {
// A vertex pi of P is embeddable if the triangle consisting of pred(pi), pi, 
// and succ(pi) does not intersect the interior of P and includes no point in out(P).
	
	console.log("checking embeddability of point ", p_i);
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
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

function embedPoint(polygon, p_i) {
// An embedment of an embeddable vertex pi of P is to remove two edges (pred(pi), pi) and (pi,succ(pi)) 
// and insert the edge (pred(pi),succ(pi)). We denote by emb(P, pi) the simple polygon obtained from P 
// by applying the embedment of pi to P

	return polygon.filter((p) => !p.isSame(p_i));
}

function isInsertable(p, idx, polygon, outsidePoints) {
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

	const rest = outsidePoints.filter((q) => !q.isSame(p));
	for (const q of rest) {
		if (pointInTriangle(p_i, p, succ_p_i, q)) {
			console.log("not insertable 4");
			return false;
		}
	}
	console.log("insertable");
	return true;
}

function insertPoint(polygon, p, idx) {
// For a point p ∈ out(P) insertable to an edge (pi,succ(pi)) of P, the insertion of p 
// to (pi,succ(pi)) is to remove (pi,succ(pi)) and insert the two edges (pi, p) and (p,succ(pi)). 
// We denote by ins(P,(pi,succ(pi)), p) the simple polygon obtained from P 
// by applying the insertion of p to (pi,succ(pi)) on P.

	const new_polygon = polygon.toSpliced(idx + 1, 0, p);
	return new_polygon;
}

function dist(p_i, p, polygon) {
// we define the distance of (pi ,succ(pi)) from p as the Euclidean distance between 
// the midpoint of (pi ,succ(pi)) and p. The distance from p to (pi ,succ(pi)) is denoted 
// by dist((pi ,succ(pi)), p). Note that, if p is not insertable to an edge (pi ,succ(pi)), 
// the distance from p to (pi ,succ(pi)) is not defined

	const succ_p_i = succ(p_i, polygon);
	const middle_point = new Point(p_i.x + ((succ_p_i.x - p_i.x) / 2), p_i.y + ((succ_p_i.y - p_i.y) / 2));
	return euclidianDist(middle_point, p);
}

function cloe(p, polygon, outsidePoints) {	
// We denote the closest edge of P among the edges insertable from p by
// cloe(P, p). If ties exist, the largest edge is cloe(P, p).

	console.log("searching for the closest edge to point ", p);
	let min_dist = Infinity;
	let min_q = null;
	let size_edge_min = 0;
	for (let i = 0; i < polygon.length; i++) {
		console.log("testing for edge", polygon[i]);
		if (isInsertable(p, i, polygon, outsidePoints)) {
			const q = polygon[i];
			const distance = dist(q, p, polygon);
			const size_edge = euclidianDist(q, succ(q, polygon));
			if (min_q == null || distance < min_dist 
			|| (distance === min_dist && size_edge > size_edge_min)) {
				console.log("found a new closest edge");
				min_dist = distance;
				min_q = q;
				size_edge_min = size_edge;
			}
		}
	}
	console.log("min_q", min_q);
	return min_q;
}

function insertablePoints(polygon, outsidePoints) {
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

function clop(polygon, outsidePoints) {	
// A point p ∈ iout(P) is the closest outside point, denoted by clop(P), of P if
// dist(cloe(P, p), p) = min q∈iout(P) {dist(cloe(P, q), q)}

	console.log("searching the closest outside point", outsidePoints);
	let min_dist = Infinity;
	let min_p = null;
	for (const p of outsidePoints) {
		console.log("testing for point", p);
		const q = cloe(p, polygon, outsidePoints);
		if (q != null) {
			const distance = dist(q, p, polygon);
			if ( min_p == null || (distance < min_dist) 
			|| (distance === min_dist && (p.x > min_p.x || (p.x === min_p.x && p.y > min_p.y)))) {
				console.log("found a new closest outside point");
				min_p = p; 
				min_dist = distance;
			}
		}
	}
	console.log("min_p", min_p);
	return min_p;
}

function larg(polygon, outsidePoints) {
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

function par(polygon, points) {
// we define the parent of P as follows:
// par(P) :=
// emb(P, larg(P)) if P has an embeddable vertex,
// ins(P, cloe(P, clop(P)), clop(P)) otherwise.

	if (polygon != null) {
		console.log("computing the parent of polygon ", polygon);
		const outsidePoints = insideOutsidePoints(points, polygon, false);
		const p = larg(polygon, outsidePoints);
		let parent = null;
		if (p == null) { 
			const closest_outside_point = clop(polygon, outsidePoints);
			if (closest_outside_point == null) { return null; }
			const closest_edge = cloe(closest_outside_point, polygon, outsidePoints);
			if (closest_edge == null) { return null; }
			parent = insertPoint(polygon, closest_outside_point, polygon.indexOf(closest_edge));
		} else { parent = embedPoint(polygon, p); }
		console.log("parent", parent);
		return parent;
	}
}

function isDigable(p_i, p, polygon, points) {
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

	const rest = points.filter((q) => !q.isSame(p) && !q.isSame(p_i) 
	&& !q.isSame(succ_p_i));
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

function isRemovable(p_i, polygon, outsidePoints, points, k) {
// A vertex pi of P is removable if (1) |out(P)| < k holds, (2) the triangle consisting of pred(pi), pi, 
// and succ(pi) lies inside P, and (3) the triangle does not contain any point of S.

	console.log("checking the removability of point", p_i);
	if (outsidePoints != null && outsidePoints.length >= k) { 
		console.log("not removable 1");
		return false; 
	}
	const pred_p_i = pred(p_i, polygon);
	const succ_p_i = succ(p_i, polygon);
	if (isRightTurn(orient(pred_p_i, p_i, succ_p_i))) { 
		console.log("not removable 2");
		return false; 
	}

	if (segmentHitsPolygon(pred_p_i, succ_p_i, polygon)) {
		console.log("not removable 3");
		return false;
	}

	const rest = points.filter((q) => !q.isSame(pred_p_i) && !q.isSame(p_i) && !q.isSame(succ_p_i));
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
		parent = par(rmv(polygon, p_j, outsidePoints, points, k), points);
	} else if (p_j == null) { 
		console.log("checking the activity of pair", p_i, p);
		parent = par(dig(p_i, p, polygon, points), points); 
	}
	if (parent == null || parent.length !== polygon.length) { activity = false; }
	else { activity = isSamePolygon(parent, polygon); } 
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