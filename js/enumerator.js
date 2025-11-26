import * as geometry from './geometry.js';

export function enumerateAtMostKOutPolygons(points, k) {
	// points = geometry.generalPosition(points);
	let hull = geometry.convexHullGrahamScan(points);
	k = Math.min(k, points.length - 3);
	let tree = findChildren(points, hull, null, 0, [], k);
	return tree;
}

export function findChildren(points, polygon, p_j, embeddable_vertices, children, k, nb_outside_points) {
	if (nb_outside_points > k) {
		return children;
	}
	children.push(polygon);
	let q = null;
	let outside_points = geometry.insideOutsidePoints(points, polygon, false);
	let child = null;
	if (p_j == null) { q = polygon[0]; }
	else { q = geometry.pred(p_j, polygon); }
	for (const p_i of polygon) {
		// if (geometry.cmp(q, p_i, polygon)) {
			const inside_points = geometry.insideOutsidePoints(points, polygon);
			for (const p of inside_points) {
				if (geometry.isActive(p_i, p, null, polygon, outside_points, points, k)) {
					child = geometry.dig(p_i, p, polygon, points);
					outside_points = geometry.insideOutsidePoints(points, polygon, false);
					embeddable_vertices = geometry.embeddableVertices(child, outside_points);
					findChildren(points, child, p_i, embeddable_vertices, children, k, outside_points.length);
				}
			}
		// }
	}
	for (const p_i of polygon) {
		if (geometry.isActive(null, null, p_i, polygon, outside_points, points, k)) {
			child = geometry.rmv(polygon, p_i, outside_points, points, k);
			outside_points = geometry.insideOutsidePoints(points, polygon, false);
			embeddable_vertices = geometry.embeddableVertices(child, outside_points);
			findChildren(points, child, null, embeddable_vertices, children, k, outside_points.length);
		}
	}
	return children;
}