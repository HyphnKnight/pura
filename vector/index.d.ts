export declare type Vector2d = [number, number];
export declare const set: (vec: [number, number], target: [number, number]) => [number, number];
export declare const addSet: (vecA: [number, number], vecB: [number, number]) => [number, number];
export declare const add: (vecA: [number, number], vecB: [number, number]) => [number, number];
export declare const subtractSet: (vecA: [number, number], vecB: [number, number]) => [number, number];
export declare const subtract: (vecA: [number, number], vecB: [number, number]) => [number, number];
export declare const scaleSet: (base: [number, number], scaleValue: number) => [number, number];
export declare const scale: (vec: [number, number], scaleValue: number) => [number, number];
export declare const lerpSet: (vecA: [number, number], vecB: [number, number], dt: number) => [number, number];
export declare const lerp: (vecA: [number, number], vecB: [number, number], dt: number) => [number, number];
export declare const equals: (vecA: [number, number], vecB: [number, number]) => boolean;
export declare const magnitudeSqr: (vec: [number, number]) => number;
export declare const magnitude: (vec: [number, number]) => number;
export declare const normalizeSet: (vec: [number, number]) => [number, number];
export declare const normalize: (vec: [number, number]) => [number, number];
export declare const normalSet: (vec: [number, number]) => [number, number];
export declare const normal: (vec: [number, number]) => [number, number];
export declare const invert: (vec: [number, number]) => [number, number];
export declare const invertSet: (vec: [number, number]) => [number, number];
export declare const dot: (vecA: [number, number], vecB: [number, number]) => number;
export declare const cross: (vecA: [number, number], vecB: [number, number]) => number;
export declare const rotateSet: (vec: [number, number], rotation: number) => [number, number];
export declare const rotate: (vec: [number, number], rotation: number) => [number, number];
export declare const angleBetween: (vecA: [number, number], vecB: [number, number]) => number;
export declare const scaleToSet: (vec: [number, number], newMagnitude: number) => [number, number];
export declare const scaleTo: (vec: [number, number], newMagnitude: number) => [number, number];
export declare const component: (vec: [number, number], directionVector: [number, number]) => number;
export declare const componentVector: (vec: [number, number], directionVector: [number, number]) => [number, number];
export declare const absolute: (vec: [number, number]) => [number, number];
export declare const copy: (vec: [number, number]) => [number, number];
