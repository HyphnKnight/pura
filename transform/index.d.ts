import { Vector2d } from '../vector';
import { Geometry } from '../geometry';
export declare class Transform {
    position: Vector2d;
    saved_positions: Vector2d[];
    rotation: number;
    saved_rotations: number[];
    constructor();
    apply: (geometry: Geometry) => Geometry;
    save(): void;
    restore(): void;
}
