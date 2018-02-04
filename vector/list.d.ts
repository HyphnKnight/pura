import { Vector2d } from './index';
export declare type VectorList = number[];
export declare const addListSet: (list: number[], vec: [number, number]) => number[];
export declare const addList: (list: number[], vec: [number, number]) => number[];
export declare const subtractListSet: (list: number[], vec: [number, number]) => number[];
export declare const subtractList: (list: number[], vec: [number, number]) => number[];
export declare const scaleListSet: (list: number[], scale: number) => number[];
export declare const scaleList: (list: number[], scale: number) => number[];
export declare const invertList: (list: number[]) => number[];
export declare const invertListSet: (list: number[]) => number[];
export declare const normalListSet: (list: number[]) => number[];
export declare const normalList: (list: number[]) => number[];
export declare const rotateListSet: (list: number[], rotation: number) => number[];
export declare const rotateList: (list: number[], rotation: number) => number[];
export declare const rotateListAround: (list: number[], point: [number, number], rotation: number) => number[];
export declare const rotateListAroundSet: (list: number[], point: [number, number], rotation: number) => number[];
export declare const scaleToList: (list: number[], newMagnitude: number) => number[];
export declare const scaleToListSet: (list: number[], newMagnitude: number) => number[];
export declare const sumList: (list: number[]) => [number, number];
export declare const averageList: (list: number[]) => [number, number];
export declare const listToVector: (list: number[]) => [number, number][];
export interface vectorIterator<type> {
    (vec: Vector2d, index: number): type;
}
export declare const forEachList: (list: number[], func: vectorIterator<void>) => void;
export declare const mapListSet: (list: number[], func: vectorIterator<[number, number]>) => number[];
export declare const mapList: (list: number[], func: vectorIterator<[number, number]>) => number[];
