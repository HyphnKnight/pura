import { filter } from '../array';
import mergeSort from '../array/mergeSort';

export const getReachable =
  <data>(
    getNeighbors: (node: data) => data[],
    resist: (current: data, neighbor: data) => number,
  ) =>
    (start: data, maxResist: number = Infinity): data[] => {
      const result: data[] = [];
      const frontier: data[] = [start];
      const costSoFar = new Map();
      costSoFar.set(start, 0);
      let current = start;
      while (frontier.length) {
        current = frontier.shift() as data;
        const currentCost = costSoFar.get(current);
        if (currentCost >= maxResist) break;
        result.push(current);
        const neighbors = getNeighbors(current);
        frontier.push(
          ...filter(neighbors, (neighbor) => {
            if (costSoFar.get(neighbor)) return false;
            const newCost = currentCost + resist(current, neighbor);
            costSoFar.set(neighbor, newCost);
            return newCost <= maxResist;
          })
        );
        mergeSort(frontier, (value) => costSoFar.get(value));
      }
      return result;
    };
