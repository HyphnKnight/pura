import { flatten } from '../array';
import { ReadonlyGraph } from '../graph';
import { distanceFromTo, generateGrid, getNeighborsGrid, Hex, roundHex } from './index';


export class HexGraph<Node> extends ReadonlyGraph<Node> {
  protected readonly hexToNode: Map<Hex, Node>;
  protected readonly valueToHex: Map<Node, Hex>;
  protected readonly hexMap: Map<string, Hex>;
  protected readonly hexGrid: Hex[][];

  constructor(radius: number, getNode: (hex: Hex) => Node) {
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
        ] as [number, number]);
      }
    }

    const nodes = hexes.map(getNode);

    super({ edges, nodes });

    this.hexToNode = new Map();
    this.valueToHex = new Map();
    this.hexGrid = grid;

    nodes.forEach((node, i) => {
      this.hexToNode.set(hexes[i], node);
      this.valueToHex.set(node, hexes[i]);
    });
  }

  public get(q: number, r: number): Node {
    const hexRef = this.hexMap.get(`${q},${r},${-q - r}`)!;
    return this.hexToNode.get(hexRef)!;
  }

  public getByHex(hex: Hex): Node {
    const hexRef = this.hexMap.get(String(hex))!;
    return this.hexToNode.get(hexRef)!;
  }

  public getByVector2d(x: number, y: number) {
    const hex: Hex = [
      x * Math.sqrt(3) / 3 - y / 3,
      y * 2 / 3,
      0,
    ];
    hex[2] = -(hex[0] + hex[1]);
    return this.getByNearestHex(hex);
  }

  public getDistanceBetween(from: Node, target: Node): number {
    return distanceFromTo(
      this.valueToHex.get(from)!,
      this.valueToHex.get(target)!,
    );
  }

  protected getByNearestHex(hex: Hex): Node {
    return this.getByHex(roundHex(hex));
  }
}
