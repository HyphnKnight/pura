import { Geometry, Rectangle } from '../geometry';
import { Vector2d } from '../vector';
export declare type cEl<geometryType extends (Geometry | null)> = {
    geometry?: Geometry;
    children?: cEl<any>[];
    render?: (el: cEl<geometryType>) => void;
    interact?: {
        onMouseDown?: (el: cEl<geometryType>, position: Vector2d) => void;
        onMouseMove?: (el: cEl<geometryType>, position: Vector2d) => void;
        onMouseUp?: (el: cEl<geometryType>, position: Vector2d) => void;
    };
};
export declare const onMouseDownCollection: Map<cEl<any>, [cEl<any>, Geometry, Function]>;
export declare const onMouseMoveCollection: Map<cEl<any>, [cEl<any>, Geometry, Function]>;
export declare const onMouseUpCollection: Map<cEl<any>, [cEl<any>, Geometry, Function]>;
export declare let windowGeometry: Rectangle;
export declare const calcCanvasSize: () => void;
export declare const renderUI: (canvas: HTMLCanvasElement, base: cEl<Geometry>) => void | (() => void);
