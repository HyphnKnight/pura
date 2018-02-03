import { filter } from '../array';
import mergeSort from '../array/mergeSort';

export const getReachable =
  <data>(
    getNeighbors: (node: data) => data[],
    resist: (current: data, neighbor: data) => number,
  ) =>
    (start: data, maxResist: number = Infinity): data[] => {
      const result: data[] = [];
      let frontier: data[] = [start];
      const cost_so_far = new Map();
      cost_so_far.set(start, 0);
      let current = start;
      while (frontier.length) {
        current = frontier.shift() as data;
        const current_cost = cost_so_far.get(current);
        if (current_cost >= maxResist) break;
        result.push(current);
        const neighbors = getNeighbors(current);
        frontier.push(
          ...filter(neighbors, neighbor => {
            if (cost_so_far.get(neighbor)) return false;
            const new_cost = current_cost + resist(current, neighbor);
            cost_so_far.set(neighbor, new_cost)
            return new_cost <= maxResist;
          })
        );
        mergeSort(frontier, (value) => cost_so_far.get(value));
      }
      return result;
    };
