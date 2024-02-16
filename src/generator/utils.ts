import {polygonCentroid} from "d3-polygon"
import {Voronoi} from "d3-delaunay";
export function relax_step(voronoi: Voronoi<any>) {
  let new_points = []

  let sx, sy;

  for (let i = 0; i < voronoi.delaunay.points.length / 2; i++) {
    sx = 0;
    sy = 0;
    let polys = voronoi.cellPolygon(i)
    try {
      new_points.push(polygonCentroid(polys))
    } catch (e) {
      console.log(i, polys)
    }
  }
  return new_points.flat();
}