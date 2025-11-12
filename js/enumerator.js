import * as geometry from './geometry.js';

export function enumerateAtMostKOutPolygons(points, k) {
	let hull = geometry.convexHullGrahamScan(points);
	let tree = findChildren(points, hull, null, 0, [], k);
	console.log("size of tree", tree.length);
	return tree;
}

export function findChildren(points, polygon, p_j, embeddable_vertices, children, k) {
	children.push(polygon);
	console.log("new polygon", polygon);
	let q = null;
	let outside_points = geometry.insideOutsidePoints(points, polygon, false);
	if (p_j == null) { q = polygon[0]; }
	else { q = geometry.pred(p_j, polygon); }
	for (const p_i of polygon) {
		if (geometry.cmp(q, p_i, polygon)) {
			const inside_points = geometry.insideOutsidePoints(points, polygon);
			for (const p of inside_points) {
				if (geometry.isActive(p_i, p, null, polygon, outside_points, points, k)) {
					embeddable_vertices = geometry.embeddableVertices(polygon, outside_points);
					findChildren(points, geometry.dig(p_i, p, polygon, points), p_i, embeddable_vertices.length, children);
				}
			}
		}
	}
	for (const p_i of polygon) {
		if (geometry.isActive(null, null, p_i, polygon, outside_points, points, k)) {
			embeddable_vertices = geometry.embeddableVertices(polygon, outside_points);
			findChildren(points, geometry.rmv(polygon, p_i, outside_points, points, k), 
			null, embeddable_vertices.length, children, k);
		}
	}
	console.log("end");
	return children;
}