import {POINT_COUNT, RELAX_STEPS, MAP_HEIGHT, MAP_WIDTH} from "../globals/GeneratorGlobals.js";
import {relax_step} from "./utils.ts";
import {Delaunay, Voronoi} from "d3-delaunay";
import {polygonCentroid} from "d3-polygon";
import {Graphics} from "pixi.js";

export interface GeneratorSettings {
  centroids: boolean,
  voronoi: boolean,
  delaunay: boolean,
  cellSite: boolean,
  cellColor: boolean,
}
export class Generator {
  private points: any[];
  stepsDone: number;
  seed: string;
  private readonly random: any;
  private readonly bounding: [number, number, number, number];
  private voronoi: Voronoi<any>;
  constructor(seed?: string) {
    this.points = [];
    this.stepsDone = 0
    this.seed = seed ? seed : (Math.random() * 9999).toString()
    this.random = Math.random

    for (let i = 0; i < POINT_COUNT; i++) {
      this.points.push(...this.generateRandomPoint(MAP_WIDTH, MAP_HEIGHT))
    }
    this.bounding = [0, 0, MAP_WIDTH, MAP_HEIGHT]
    this.voronoi = new Delaunay(this.points).voronoi(this.bounding);
  }

  generateRandomPoint(maxX: number, maxY: number) {
    return [Math.floor(this.random() * (maxX - 20)) + 10,
      Math.floor(this.random() * (maxY - 20)) + 10];
  }

  relax_points() {
    for (let i = 0; i < RELAX_STEPS; i++) {
      this.points = relax_step(this.voronoi);
      // console.log(this.points)
      this.voronoi = new Delaunay(this.points).voronoi(this.bounding);
      this.stepsDone += 1;
    }
  }

  static colors = ["2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D"]

  draw(graphics: Graphics, settings: GeneratorSettings) {
    if (settings.cellColor) {
      for (let i = 0; i < this.voronoi.delaunay.points.length / 2; i++) {
        let polys = this.voronoi.cellPolygon(i)
        try {
          graphics.beginFill(`0x4230${Generator.colors[i%12]}${Generator.colors[i%12]}`);
          graphics.drawPolygon(polys.flat())
          graphics.endFill();
        } catch (e) {
          console.log(polys)
        }

      }
    }

    if (settings.voronoi) {
      graphics.lineStyle(2, 0xcecece)
      this.voronoi.render(graphics)
    }

    if (settings.delaunay) {
      graphics.lineStyle(2, 0x42a786)
      this.voronoi.delaunay.render(graphics)
    }

    if (settings.cellSite) {
      for (let i = 0; i < this.points.length; i += 2) {
        graphics.beginFill(0xffffff, 0.75);
        graphics.drawCircle(this.points[i], this.points[i + 1], 5);
        graphics.endFill();
      }
    }


    if (settings.centroids) {
      for (let i = 0; i < this.voronoi.delaunay.points.length / 2; i++) {
        let polys = this.voronoi.cellPolygon(i)
        try {
          let p = polygonCentroid(polys)
          graphics.beginFill(0xD95D39, 0.5);
          graphics.drawCircle(p[0], p[1], 5);
          graphics.endFill();
        } catch (_) {
          console.log(polys)
        }
      }
    }
  }
}