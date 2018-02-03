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
      let frontier: [data, number][] = [[start, heuristic(goal, start)]];
      const came_from = new Map();
      const cost_so_far = new Map();
      came_from.set(start, null);
      cost_so_far.set(start, 0);
      let current = start;
      while (frontier.length) {
        const [current] = frontier.shift() as [data, number];
        const current_cost = cost_so_far.get(current);
        if (current === goal)
          break;
        if (current_cost >= maxResist)
          return null;
        forEach(getNeighbors(current), neighbor => {
          const new_cost = current_cost + resist(current, neighbor);
          const old_cost = cost_so_far.get(neighbor);
          if (!old_cost || new_cost < old_cost) {
            cost_so_far.set(neighbor, new_cost);
            const priority = new_cost + heuristic(goal, neighbor);
            frontier.push([neighbor, priority]);
            came_from.set(neighbor, current);
          }
        });
        frontier = mergeSort(frontier, ([, value]) => value);
      }
      const path = [];
      current = goal;
      while (current !== start) {
        path.unshift(current);
        current = came_from.get(current);
      }
      return path;
    };
