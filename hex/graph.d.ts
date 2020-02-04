import { ReadonlyGraph } from '../graph';
import { Hex } from './index';
export declare class HexGraph<Node> extends ReadonlyGraph<Node> {
    protected readonly hexToNode: Map<Hex, Node>;
    protected readonly valueToHex: Map<Node, Hex>;
    protected readonly hexMap: Map<string, Hex>;
    constructor(radius: number, getNode: (hex: Hex) => Node);
    get(q: number, r: number): Node;
    getByHex(hex: Hex): Node;
    getByVector2d(x: number, y: number): Node;
    getDistanceBetween(from: Node, target: Node): number;
    protected getByNearestHex(hex: Hex): Node;
}
