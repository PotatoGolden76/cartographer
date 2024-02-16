import './style.css'

import {Application, Graphics} from 'pixi.js';
import {Generator} from "./generator/Generator.ts";
import {MAP_HEIGHT, MAP_WIDTH, POINT_COUNT, RELAX_STEPS} from "./globals/GeneratorGlobals.ts";
import {Viewport} from "pixi-viewport";

export default class App extends Application<HTMLCanvasElement> {
    constructor() {
        super({
            width: window.innerWidth,
            height: window.innerHeight,
            autoResize: true,
            resolution: devicePixelRatio,
            backgroundColor: 0x211e1f,
            antialias: true
        });
    }

    async init() {
        // Set view
        document.getElementById('root').appendChild(this.view);
    }
}

export function createButton(parent, text, callback) {
    const btn = document.createElement("button");
    btn.innerText = text
    btn.onclick = callback
    parent.appendChild(btn)
}

export function createTextField(parent, text) {
    const btn = document.createElement("p");
    btn.innerText = text
    parent.appendChild(btn)
}

const app = new App();
await app.init();

let generator = new Generator("whatever");
let generatorDrawSettings = {
    centroids: false,
    voronoi: true,
    delaunay: true,
    cellSite: true,
    cellColor: true,
}

const controlsPanel = document.getElementById('controls')
const detailsPanel = document.getElementById('info')

function redraw() {
    graphics.clear()
    generator.draw(graphics, generatorDrawSettings)
    drawInfo()
}
function drawInfo() {
    detailsPanel.innerHTML = ""
    createTextField(detailsPanel, `Point count: ${POINT_COUNT}`)
    createTextField(detailsPanel, `Relax steps: ${RELAX_STEPS}`)
    createTextField(detailsPanel, `Steps done: ${generator.stepsDone}`)
    createTextField(detailsPanel, `Seed: ${generator.seed}`)
    createTextField(detailsPanel, `\n\n----- controls -----`)
    createTextField(detailsPanel, `[1] | Voronoi`)
    createTextField(detailsPanel, `[2] | Delaunay`)
    createTextField(detailsPanel, `[3] | sites`)
    createTextField(detailsPanel, `[4] | centroids`)
    createTextField(detailsPanel, `[5] | cell colors`)
    createTextField(detailsPanel, `\n[ENTER] | center map`)
}

createButton(
    controlsPanel,
    "[G]\n Regenerate",
    () => {
        generator = new Generator()
        redraw()
    }
)

createButton(
    controlsPanel,
    "[R]\n Relax Cells",
    () => {
        generator.relax_points()
        redraw()
    }
)

// create viewport
const viewport = new Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: MAP_WIDTH,
    worldHeight: MAP_HEIGHT+200,
    events: app.renderer.events // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
}).drag()
    .pinch()
    .wheel()
    .decelerate()

// add the viewport to the stage
app.stage.addChild(viewport)

//Graphics
let graphics = new Graphics();
viewport.addChild(graphics);
redraw()

function centerViewport() {
    viewport.fit()
    viewport.moveCenter(MAP_WIDTH / 2, MAP_HEIGHT / 2)
}

document.addEventListener("keydown", (ev) => {
    if (ev.isComposing || ev.key === "Enter") {
        centerViewport()
        return
    }

    if (ev.isComposing || ev.key === "g") {
        generator = new Generator()
        redraw()
        return
    }

    if (ev.isComposing || ev.key === "r") {
        generator.relax_points()
        redraw()
        return
    }

    if (ev.isComposing || ev.key === "1") {
        generatorDrawSettings.voronoi = !generatorDrawSettings.voronoi
        redraw()
        return
    }

    if (ev.isComposing || ev.key === "2") {
        generatorDrawSettings.delaunay = !generatorDrawSettings.delaunay
        redraw()
        return
    }

    if (ev.isComposing || ev.key === "3") {
        generatorDrawSettings.cellSite = !generatorDrawSettings.cellSite
        redraw()
        return
    }

    if (ev.isComposing || ev.key === "4") {
        generatorDrawSettings.centroids = !generatorDrawSettings.centroids
        redraw()
        return
    }
    if (ev.isComposing || ev.key === "5") {
        generatorDrawSettings.cellColor = !generatorDrawSettings.cellColor
        redraw()
    }
})

window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    viewport.resize(window.innerWidth, window.innerHeight)
    centerViewport()
});

centerViewport()
