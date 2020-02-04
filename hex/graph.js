import { flatten } from '../array';
import { ReadonlyGraph } from '../graph';
import { distanceFromTo, generateGrid, getNeighborsGrid, roundHex } from './index';
export class HexGraph extends ReadonlyGraph {
    constructor(radius, getNode) {
        const grid = generateGrid(radius);
        const getNeighbors = getNeighborsGrid(grid);
        const hexes = flatten(grid);
        const edges = [];
        for (const hex of hexes) {
            const hexIndex = hexes.indexOf(hex);
            const neighbors = getNeighbors(hex);
            for (const neighborHex of neighbors) {
                edges.push([
                    hexIndex,
                    hexes.indexOf(neighborHex),
                ]);
            }
        }
        const nodes = hexes.map(getNode);
        super({ edges, nodes });
        this.hexToNode = new Map();
        this.valueToHex = new Map();
        nodes.forEach((node, i) => {
            this.hexToNode.set(hexes[i], node);
            this.valueToHex.set(node, hexes[i]);
        });
    }
    get(q, r) {
        const hexRef = this.hexMap.get(`${q},${r},${-q - r}`);
        return this.hexToNode.get(hexRef);
    }
    getByHex(hex) {
        const hexRef = this.hexMap.get(String(hex));
        return this.hexToNode.get(hexRef);
    }
    getByVector2d(x, y) {
        const hex = [
            x * Math.sqrt(3) / 3 - y / 3,
            y * 2 / 3,
            0,
        ];
        hex[2] = -(hex[0] + hex[1]);
        return this.getByNearestHex(hex);
    }
    getDistanceBetween(from, target) {
        return distanceFromTo(this.valueToHex.get(from), this.valueToHex.get(target));
    }
    getByNearestHex(hex) {
        return this.getByHex(roundHex(hex));
    }
}
