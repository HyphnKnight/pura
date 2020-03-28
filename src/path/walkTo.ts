import { forEach, map } from '../array';
import quickSort from '../array/quickSort';
import { createNode, Node } from './node';

export interface WalkToData<data> {
  start: data;
  destination: data;
  getUniqueId: (data: data) => string;
  getNeighbors: (currentPos: data) => data[];
  priorityFunc: (currentPos: data, destination: data) => number;
  resistFunc: (src: data, next: data) => number;
  maxResist: number;
}

export function* walkTo<data>(pathingData: WalkToData<data>): IterableIterator<data> {
  const {
    start, destination,
    getUniqueId, getNeighbors,
    priorityFunc, resistFunc, maxResist
  } = pathingData;

  if (start === destination) return destination;

  let rootNode: Node<data> = createNode<data>(getUniqueId(start), start, 0, priorityFunc(start, destination));
  const nodes: { [id: string]: Node<data> } = { [rootNode.id]: rootNode };
  let newNeighbors: Node<data>[] = [rootNode];

  while (newNeighbors[0].data !== destination) {
    if (rootNode.priority > maxResist) { return null; }

    newNeighbors = map(
      getNeighbors(rootNode.data),
      (neighbor) => {
        const node = nodes[getUniqueId(neighbor)];
        if (node) {
          node.resist += rootNode.resist + resistFunc(rootNode.data, neighbor);
          node.priority = node.resist + priorityFunc(neighbor, destination);
          return node;
        } else {
          const resist = rootNode.resist + resistFunc(rootNode.data, neighbor);
          const priority = resist + priorityFunc(neighbor, destination);
          return createNode(
            getUniqueId(neighbor),
            neighbor,
            resist,
            priority,
            rootNode,
          );
        }
      }
    );

    newNeighbors = quickSort(
      newNeighbors,
      (node) => node.priority + Number(node === rootNode) * node.priority
    );

    forEach(newNeighbors, (node) => nodes[node.id] = node);

    rootNode = newNeighbors[0];
    yield rootNode.data;
  }

}
