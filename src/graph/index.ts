import { remove } from '../array';
import { getReachable, pathTo } from '../path';


export interface GraphData<Node> {
  nodes: Node[];
  edges: Array<[number, number]>;
}

export type Edge<Node> = [Node, Node];

export class ReadonlyGraph<Node> {
  protected readonly nodeList: Node[];
  protected readonly edgeList: Array<Edge<Node>>;
  protected readonly nodeToEdgeMap: Map<Node, Array<Edge<Node>>>;

  constructor({ nodes, edges: edgeLookups }: GraphData<Node>) {
    this.nodeList = [...nodes];
    this.edgeList = [...edgeLookups.map(([sourceIndex, targetIndex]) => ([
      this.nodeList[sourceIndex]!,
      this.nodeList[targetIndex]!,
    ] as Edge<Node>))];
    this.nodeToEdgeMap = new Map();
    for (const edge of this.edgeList) {
      const [start] = edge;
      if (this.nodeToEdgeMap.has(start)) {
        this.nodeToEdgeMap.set(start, []);
      }
      this.nodeToEdgeMap.get(start)!.push(edge);
    }
  }

  get nodes() {
    return this.nodeList as ReadonlyArray<Node>;
  }

  get edges() {
    return this.edgeList as ReadonlyArray<Edge<Node>>;
  }

  public getEdges(root: Node): Array<Edge<Node>> {
    return this.nodeToEdgeMap.get(root)!;
  }

  public getNeighbors(root: Node): Node[] {
    return this.getEdges(root).map(([, target]) => target);
  }

  public createPathTo(
    resist: (current: Node, neighbor: Node) => number,
    heuristic: (goal: Node, neighbor: Node) => number,
    maxResist = Infinity,
  ) {
    return pathTo<Node>(
      (value) => this.getNeighbors(value),
      resist,
      heuristic,
      maxResist,
    );
  }

  public createGetReachable(resist: (current: Node, neighbor: Node) => number) {
    return getReachable<Node>(
      (value) => this.getNeighbors(value),
      resist,
    );
  }

  // tslint:disable-next-line: member-ordering
  public readonly getWithin = this.createGetReachable(() => 1);

  public toJSON(): GraphData<Node> {
    return {
      nodes: this.nodeList,
      edges: this.edges.map(([source, target]) => ([
        this.nodeList.indexOf(source)!,
        this.nodeList.indexOf(target)!,
      ] as [number, number])),
    };
  }
}

export class Graph<Node> extends ReadonlyGraph<Node> {
  public addNode(node: Node): Node {
    this.nodeList.push(node);
    return node;
  }

  public addEdge(source: Node, target: Node): Edge<Node> {
    const edge: Edge<Node> = [source, target];
    this.edgeList.push(edge);
    if (!this.nodeToEdgeMap.has(source)) {
      this.nodeToEdgeMap.set(source, []);
    }
    this.nodeToEdgeMap.get(source)!.push(edge);
    return edge;
  }

  public removeNode(node: Node): void {
    remove(this.nodeList, node);

    let i = 0;
    while (i < this.edgeList.length) {
      const [source, target] = this.edgeList[i];
      if (source === node || target === node) {
        this.edgeList.splice(i, 1);
      } else {
        ++i;
      }
    }
  }

  public removeEdge(edge: Edge<Node>): void {
    let i = 0;
    while (i < this.edgeList.length) {
      const edgeToMatch = this.edgeList[i];
      if (edgeToMatch[0] === edge[0] &&
        edgeToMatch[1] === edge[1]) {
        this.edgeList.splice(i, 1);
      } else {
        ++i;
      }
    }
  }
}
