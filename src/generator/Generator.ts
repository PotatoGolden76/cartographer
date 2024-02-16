import {POINT_COUNT, RELAX_STEPS, MAP_HEIGHT, MAP_WIDTH} from "../globals/GeneratorGlobals.js";
import {dist, relax_step} from "./utils.ts";
import {Delaunay, Voronoi} from "d3-delaunay";
import {polygonCentroid} from "d3-polygon";
import {Graphics} from "pixi.js";
import {createNoise2D} from "simplex-noise";

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
    private readonly noise = createNoise2D();
    private readonly bounding: [number, number, number, number];
    public voronoi: Voronoi<any>;

    constructor(seed?: string) {
        this.points = [];
        this.stepsDone = 0
        this.seed = seed || (Math.ceil(Math.random() * 9999)).toString()
        this.random = Math.random

        for (let i = 0; i < POINT_COUNT; i++) {
            let t = this.generateRandomPoint(MAP_WIDTH, MAP_HEIGHT)
            while (this.points.find((e) => e[0] === t[0] && e[1] === t[1]))
                t = this.generateRandomPoint(MAP_WIDTH, MAP_HEIGHT);
            this.points.push(t)
            // this.points.push(...t)
        }
        // Testing some sorting, don't mind
        this.points.sort((a, b) => {

                if (a[0] === b[0]) {
                    if ((a[1] - b[1]) < 0) {
                        return -1
                    } else {
                        return 1
                    }
                }

                if ((a[0] - b[0]) < 0) {
                    return -1
                } else {
                    return 1
                }

            }
        )
        this.points = this.points.flat()

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


    draw(graphics: Graphics, settings: GeneratorSettings) {
        const scaleCoefficient = 0.002;
        if (settings.cellColor) {
            for (let i = 0; i < this.voronoi.delaunay.points.length; i+=2) {
                let polys = this.voronoi.cellPolygon(i/2)
                try {
                    let x = this.voronoi.delaunay.points[i]*scaleCoefficient
                    let y = this.voronoi.delaunay.points[i+1]*scaleCoefficient
                    let current = this.noise(x, y)
                    current = current-1/(dist(this.voronoi.delaunay.points[i], this.voronoi.delaunay.points[i+1], MAP_WIDTH, MAP_HEIGHT)*scaleCoefficient*15)
                    // console.log(`[${this.voronoi.delaunay.points[i]}, ${this.voronoi.delaunay.points[i+1]}]`, current, i)
                    if(current < 0) {
                        graphics.beginFill(`0x424269`);
                    } else {
                        graphics.beginFill(`0xd1a882`);
                    }
                    graphics.drawPolygon(polys.flat())
                    graphics.endFill();
                } catch (e) {
                    console.log("O crapat :(")
                    console.log(this.points.reduce(function (rows, key, index) {
                        return (index % 2 == 0 ? rows.push([key])
                            : rows[rows.length-1].push(key)) && rows;
                    }, []))
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