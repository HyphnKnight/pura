import { forEach } from '../array';
import mergeSort from '../array/mergeSort';

export const pathTo =
  <data>(
    getNeighbors: (node: data) => data[],
    resist: (current: data, neighbor: data) => number,
    heuristic: (goal: data, neighbor: data) => number,
    maxResist: number = Infinity
  ) =>
    (start: data, goal: data): data[] | null => {
      let frontier: Array<[data, number]> = [[start, heuristic(goal, start)]];
      const cameFrom = new Map();
      const costSoFar = new Map();
      cameFrom.set(start, null);
      costSoFar.set(start, 0);
      let current = start;
      while (frontier.length) {
        current = frontier.shift() as [data, number];
        const currentCost = costSoFar.get(current);
        if (current === goal) {
          break;
        }
        if (currentCost >= maxResist) {
          return null;
        }
        forEach(getNeighbors(current), (neighbor) => {
          const newCost = currentCost + resist(current, neighbor);
          const oldCost = costSoFar.get(neighbor);
          if (!oldCost || newCost < oldCost) {
            costSoFar.set(neighbor, newCost);
            const priority = newCost + heuristic(goal, neighbor);
            frontier.push([neighbor, priority]);
            cameFrom.set(neighbor, current);
          }
        });
        frontier = mergeSort(frontier, ([, value]) => value);
      }
      const path = [];
      current = goal;
      while (current !== start) {
        path.unshift(current);
        current = cameFrom.get(current);
      }
      return path;
    };
