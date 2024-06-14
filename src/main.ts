import Matter from "matter-js"
import {
    Engine as MatterEngine,
    Render as MatterRender,
    Runner as MatterRunner
} from "matter-js";
import { delete_from_map, is_in_map } from "./utilities";

const Engine = Matter.Engine;
const Render = Matter.Render;
const Runner = Matter.Runner;
const Bodies = Matter.Bodies;
const Body = Matter.Body;
const Composite = Matter.Composite;

const TILE_SIZE = 30;

enum MouseClick {
    Left = 0,
    Right = 2
}

enum TileType {
    Block = 0,
    Variable = 1
}

interface Coordinates {
    x: number,
    y: number
}

// Elements
const select = document.getElementById("selection") as HTMLSelectElement;
const start_btn = document.getElementById("start") as HTMLButtonElement;
const stop_btn = document.getElementById("stop") as HTMLButtonElement;

class Game {
    engine: MatterEngine;
    runner: MatterRunner;
    render: MatterRender;

    tilemap: Map<Coordinates, [Matter.Body, TileType]>;
    current_tile_type: TileType;

    constructor() {
        this.engine = Engine.create();
        this.runner = Runner.create();

        this.render = Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                wireframes: false,
                background: "#eeeee4"
            }
        });

        this.render.element.addEventListener(
            "mousedown", (event) => this.handle_click(event)
        );

        this.tilemap = new Map();

        // Making `current_tile_type` update
        select.selectedIndex = 0;
        this.current_tile_type = 0;
        select?.addEventListener("change", (event) => {
            this.current_tile_type = parseInt((event.target as HTMLSelectElement).value);
        });

        // Starting button
        start_btn.addEventListener("click", () => this.start_physics());

        // Stopping button
        stop_btn.disabled = true;
        stop_btn.addEventListener("click", () => this.stop_physics());
    }

    handle_click(event: MouseEvent) {
        if (select.disabled) return;

        const position: Coordinates = {
            x: event.offsetX,
            y: event.offsetY,
        };

        const tiled_position: Coordinates = {
            x: Math.floor(position.x / TILE_SIZE),
            y: Math.floor(position.y / TILE_SIZE),
        };

        switch (event.button as MouseClick) {
            case MouseClick.Left: this.create_tile(tiled_position); break;
            case MouseClick.Right: this.destroy_tile(tiled_position); break;
        }
    }

    create_tile(tiled_position: Coordinates) {
        if (is_in_map(this.tilemap, tiled_position))
            return;

        const real_position: Coordinates = {
            x: tiled_position.x * TILE_SIZE + TILE_SIZE / 2,
            y: tiled_position.y * TILE_SIZE + TILE_SIZE / 2,
        };

        let new_tile;

        switch (this.current_tile_type) {
            case TileType.Block:
                new_tile = Bodies.rectangle(
                    real_position.x,
                    real_position.y,
                    TILE_SIZE,
                    TILE_SIZE,
                    { isStatic: true }
                );

                break;
            
            case TileType.Variable:
                new_tile = Bodies.circle(
                    real_position.x,
                    real_position.y,
                    TILE_SIZE / 2,
                    { isStatic: true }
                );
                
                break
        }

        Composite.add(
            this.engine.world,
            [new_tile]
        );

        this.tilemap.set(tiled_position, [new_tile, this.current_tile_type]);
        console.log(this.tilemap);
    }

    destroy_tile(tiled_position: Coordinates) {
        const body = is_in_map(this.tilemap, tiled_position);

        if (body) {
            Composite.remove(this.engine.world, body[0]);
            delete_from_map(this.tilemap, tiled_position);
        }
    }

    start_physics() {
        select.disabled = true;
        stop_btn.disabled = false;
        start_btn.disabled = true;

        for (const [_, [body, type]] of this.tilemap) {
            if (type == TileType.Variable)
                Body.setStatic(body, false);
        }
    }

    stop_physics() {
        select.disabled = false;
        stop_btn.disabled = true;
        start_btn.disabled = false;

        for (const [coordinates, [body, type]] of this.tilemap) {
            if (type == TileType.Variable) {
                Body.setStatic(body, true);
                Body.setPosition(
                    body,
                    { x: coordinates.x * TILE_SIZE, y: coordinates.y * TILE_SIZE }
                );
            }
        }
    }

    run() {
        Render.run(this.render);
        Runner.run(this.runner, this.engine);
    }
}

let game = new Game();
game.run();