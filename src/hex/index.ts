import { Vector2d } from '../vector';
import { map, flatten, filter, any } from '../array';
import { lerp as nLerp } from '../math';

export type Hex = [
  // Also a 3d Vector
  number, // x
  number, // y
  number  // z
];

const neighborPosition: Hex[] = [
  [0, 1, -1],
  [1, 0, -1],
  [1, -1, 0],
  [-1, 1, 0],
  [0, -1, 1],
  [-1, 0, 1],
];

export const get =
  (grid: Hex[][]) =>
    ([q, r]: Vector2d | Hex): Hex | null => {
      const radius = (grid.length - 1) / 2;
      const y = r + radius;
      const x = q + radius + Math.min(0, y - radius);
      return grid[y]
        ? grid[y][x]
        : null;
    };

function roundHex(hex: Hex): Hex {
  const rHex: Hex = [
    Math.round(hex[0]),
    Math.round(hex[1]),
    Math.round(hex[2]),
  ];
  const dHex: Hex = [
    Math.abs(rHex[0] - hex[0]),
    Math.abs(rHex[1] - hex[1]),
    Math.abs(rHex[2] - hex[2]),
  ];
  if (dHex[0] > dHex[1] && dHex[0] > dHex[2]) {
    rHex[0] = -rHex[1] - rHex[2];
  } else if (dHex[1] > dHex[2]) {
    rHex[1] = -rHex[0] - rHex[2];
  } else {
    rHex[2] = -rHex[0] - rHex[1];
  }
  return rHex;
}

export const hexToVector2d =
  (hex: Hex): Vector2d => ([
    Math.sqrt(3) * (hex[0] + hex[1] / 2),
    3 / 2 * hex[1]
  ]);

export const vector2dToHex =
  (vec: Vector2d): Hex => {
    const [x, y] = vec;
    const hex: Hex = [0, 0, 0];
    hex[0] = x * Math.sqrt(3) / 3 - y / 3;
    hex[1] = y * 2 / 3;
    hex[2] = -(hex[0] + hex[1])
    return roundHex(hex);
  };

export const getFromVector2d =
  (grid: Hex[][]) =>
    (vec: Vector2d): Hex | null =>
      get(grid)(vector2dToHex(vec));

const convertQRToXYZ =
  (qr: Vector2d): Hex =>
    ([qr[0], qr[1], -qr[0] - qr[1]]);

export const distanceFromTo =
  (hex: Hex, targetHex: Hex): number =>
    (Math.abs(hex[0] - targetHex[0]) +
      Math.abs(hex[1] - targetHex[1]) +
      Math.abs(hex[2] - targetHex[2])) / 2;

export const add =
  (hexA: Hex) =>
    (hexB: Hex): Hex => ([
      hexA[0] + hexB[0],
      hexA[1] + hexB[1],
      hexA[2] + hexB[2],
    ]);

export const addGrid =
  (grid: Hex[][]) =>
    (hexA: Hex) =>
      (hexB: Hex): Hex | null =>
        get(grid)([
          hexA[0] + hexB[0],
          hexA[1] + hexB[1],
        ]);

export const subtract =
  (hexA: Hex) =>
    (hexB: Hex): Hex => ([
      hexA[0] - hexB[0],
      hexA[1] - hexB[1],
      hexA[2] - hexB[2],
    ]);

export const subtractGrid =
  (grid: Hex[][]) =>
    (hexA: Hex) =>
      (hexB: Hex): Hex | null =>
        get(grid)([
          hexA[0] - hexB[0],
          hexA[1] - hexB[1],
        ]);

export const getNeighbors =
  (hex: Hex): Hex[] =>
    map(neighborPosition, add(hex));

export const getNeighborsGrid =
  (grid: Hex[][]) =>
    (hex: Hex): Hex[] =>
      filter<Hex | null, Hex>(map(neighborPosition, addGrid(grid)(hex)));

export const lerp =
  (hexA: Hex, hexB: Hex, dt: number): Hex => ([
    nLerp(hexA[0], hexB[0], dt),
    nLerp(hexA[1], hexB[1], dt),
    nLerp(hexA[2], hexB[2], dt),
  ]);

export const lerpGrid =
  (grid: Hex[][]) =>
    (hexA: Hex, hexB: Hex, dt: number): Hex | null =>
      get(grid)([
        nLerp(hexA[0], hexB[0], dt),
        nLerp(hexA[1], hexB[1], dt),
      ]);

export const lineFromTo =
  (src: Hex, dest: Hex): Hex[] => {
    const distance = distanceFromTo(src, dest);
    const path: Hex[] = []
    for (let i = 0; i < distance; ++i) {
      path[i] = roundHex(lerp(src, dest, (i + 1) / distance));
    }
    return path;
  };

export const lineFromToGrid =
  (grid: Hex[][]) =>
    (src: Hex, dest: Hex): Hex[] | null => {
      const distance = distanceFromTo(src, dest);
      const path: Hex[] = []
      let i = -1;
      while (++i < distance) {
        const hex = get(grid)(roundHex(lerp(src, dest, (i + 1) / distance)));
        if (!hex) return null;
        path[i] = hex;
      }
      return path;
    };

export const getWithin =
  (hex: Hex, radius: number): Hex[] => {
    const hexes: Hex[] = [];
    for (let dx = -radius; dx <= radius; ++dx) {
      const limit = Math.min(radius, -dx + radius);
      for (let dy = Math.max(-radius, -dx - radius); dy <= limit; ++dy) {
        hexes.push(convertQRToXYZ([
          dx + hex[0],
          -dx - dy + hex[1],
        ]));
      }
    }
    return hexes;
  }

export const getWithinGrid =
  (grid: Hex[][]) =>
    (hex: Hex, radius: number): Hex[] => {
      const hexes: (Hex | null)[] = [];
      for (let dx = -radius; dx <= radius; ++dx) {
        const limit = Math.min(radius, -dx + radius);
        for (let dy = Math.max(-radius, -dx - radius); dy <= limit; ++dy) {
          hexes.push(get(grid)([
            dx + hex[0],
            -dx - dy + hex[1],
          ]));
        }
      }
      return filter<Hex | null, Hex>(hexes);
    };

export const getRing =
  (hex: Hex, distance: number): Hex[] => {
    const distanceHex = convertQRToXYZ([-distance, distance]);
    let currentHex: Hex = add(hex)(distanceHex);
    const path: Hex[] = [];
    for (let i = 0; i < 6; ++i) {
      for (let j = 0; j < distance; ++j) {
        currentHex = add(currentHex)(neighborPosition[i]);
        path.push(currentHex);
      }
    }
    return path;
  };

export const getRingGrid =
  (grid: Hex[][]) =>
    (hex: Hex, distance: number): Hex[] =>
      filter(map(getRing(hex, distance), get(grid)));

export const getSpiral =
  (hex: Hex, distance: number): Hex[] => {
    const results: Hex[][] = [];
    for (let i = 0; i < distance; ++i) {
      results.push(getRing(hex, i));
    }
    return flatten(results);
  }

export const getSpiralGrid =
  (grid: Hex[][]) =>
    (hex: Hex, distance: number): Hex[] =>
      filter(map(getSpiral(hex, distance), get(grid)));

export const getFieldOfView =
  (hex: Hex, range: number, isBlocked: (hex: Hex) => boolean): Hex[] =>
    filter(
      getWithin(hex, range),
      (tHex: Hex) =>
        !isBlocked(tHex) &&
        !any(lineFromTo(hex, tHex), isBlocked)
    );

export const getFieldOfViewGrid =
  (grid: Hex[][]) =>
    (hex: Hex, range: number, isBlocked: (hex: Hex) => boolean): Hex[] =>
      filter(
        getWithinGrid(grid)(hex, range),
        (tHex: Hex) => {
          if (!isBlocked(tHex)) return false;
          const line = lineFromToGrid(grid)(hex, tHex);
          if (!line) return false;
          return !any(line, isBlocked)
        }
      );

export const generateGrid =
  (radius: number): Hex[][] => {
    let rows = radius * 2 + 1;
    const grid: Hex[][] = [];
    for (let y = 0; y < rows; ++y) {
      const row = y <= radius
        ? radius + 1 + y
        : radius * 3 + 1 - y;
      for (let x = 0; x < row; ++x) {
        if (!grid[y]) grid[y] = [];
        grid[y][x] = convertQRToXYZ([
          -radius - Math.min(0, y - radius) + x,
          y - radius,
        ]);
      }
    }
    return grid;
  };
