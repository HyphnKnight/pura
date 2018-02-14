import { pathTo } from '../path/pathTo';
import { getNeighbors, Hex } from './index';

export const hexPathTo =
  (
    resist: (current: Hex, neighbor: Hex) => number,
    heuristic: (goal: Hex, neighbor: Hex) => number,
    maxResist: number = Infinity
  ) =>
    pathTo<Hex>(
      getNeighbors,
      resist,
      heuristic,
      maxResist,
    );
