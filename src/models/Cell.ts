import {MapPoint} from "./Point.ts";
import {Point} from "pixi.js";

export interface Cell {
    site: MapPoint,
    hull: MapPoint[],

}