import { flatten } from '../array';
import { ReadonlyGraph } from '../graph';
import { distanceFromTo, generateGrid, getNeighborsGrid, Hex, roundHex } from './index';


export class HexGraph<Value> extends ReadonlyGraph<Value> {
  protected readonly hexMap: Map<Value, Hex>;

  constructor(radius: number, getValue: (hex: Hex) => Value) {
    const grid = generateGrid(radius);
    const getNeighbors = getNeighborsGrid(grid);

    const hexes = flatten(grid);
    const edges = [];

    for (let h = 0; h < hexes.length; ++h) {
      const hex = hexes[h];
      const hexIndex = hexes.indexOf(hex);
      const neighbors = getNeighbors(hex);
      for (let n = 0; n < neighbors.length; ++n) {
        const neighborHex = neighbors[n];
        edges.push([
          hexIndex,
          hexes.indexOf(neighborHex),
        ]);
      }
    }

    const values = hexes.map(getValue);

    super({
      edges, values,
      getUniqueId: (value: Value) =>
        String(hexes[values.indexOf(value)]),
    });

    this.hexMap = new Map();

    values.forEach((value, i) => {
      this.hexMap.set(value, hexes[i]);
    });
  }

  public get(q: number, r: number): Value {
    const node = this.hexMap[`${q},${r},${-q - r}`];
    if (!node) return null;
    return node.value;
  }

  public getByHex(hex: Hex): Value {
    return this.hexMap[String(hex)].value;
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

  public getDistanceBetween(from: Value, target: Value): number {
    return distanceFromTo(
      this.hexMap.get(from),
      this.hexMap.get(target),
    );
  }

  protected getByNearestHex(hex: Hex): Value {
    return this.getByHex(roundHex(hex));
  }
}
