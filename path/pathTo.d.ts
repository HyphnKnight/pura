export declare const pathTo: <data>(getNeighbors: (node: data) => data[], resist: (current: data, neighbor: data) => number, heuristic: (goal: data, neighbor: data) => number, maxResist?: number) => (start: data, goal: data) => data[] | null;
