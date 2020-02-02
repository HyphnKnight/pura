import { remove } from '../array';
import { getReachable, pathTo } from '../path';


export interface GraphData<Value> {
  nodes: Value[];
  edges: Array<[number, number]>;
}

export type Edge<Value> = [Value, Value];

export class ReadonlyGraph<Value> {
  protected readonly nodeList: Value[];
  protected readonly edgeList: Array<Edge<Value>>;
  protected readonly nodeToEdgeMap: Map<Value, Array<Edge<Value>>>;

  constructor({ nodes, edges: edgeLookups }: GraphData<Value>) {
    this.nodeList = [...nodes];
    this.edgeList = [...edgeLookups.map(([sourceIndex, targetIndex]) => ([
      this.nodeList[sourceIndex]!,
      this.nodeList[targetIndex]!,
    ] as Edge<Value>))];
    this.nodeToEdgeMap = new Map();
    for (const edge of this.edgeList) {
      const [start] = edge;
      if (this.nodeToEdgeMap.has(start)) {
        this.nodeToEdgeMap.set(start, []);
      }
      this.nodeToEdgeMap.get(start).push(edge);
    }
  }

  get nodes() {
    return this.nodeList as ReadonlyArray<Value>;
  }

  get edges() {
    return this.edgeList as ReadonlyArray<Edge<Value>>;
  }

  public getEdges(root: Value): Array<Edge<Value>> {
    return this.nodeToEdgeMap.get(root);
  }

  public getNeighbors(root: Value): Value[] {
    return this.getEdges(root).map(([, target]) => target);
  }

  public createPathTo(
    resist: (current: Value, neighbor: Value) => number,
    heuristic: (goal: Value, neighbor: Value) => number,
    maxResist = Infinity,
  ) {
    return pathTo<Value>(
      (value) => this.getNeighbors(value),
      resist,
      heuristic,
      maxResist,
    );
  }

  public createGetReachable(resist: (current: Value, neighbor: Value) => number) {
    return getReachable<Value>(
      (value) => this.getNeighbors(value),
      resist,
    );
  }

  // tslint:disable-next-line: member-ordering
  public readonly getWithin = this.createGetReachable(() => 1);

  public toJSON(): GraphData<Value> {
    return {
      nodes: this.nodeList,
      edges: this.edges.map(([source, target]) => ([
        this.nodeList.indexOf(source),
        this.nodeList.indexOf(target),
      ])),
    };
  }
}

export class Graph<Value> extends ReadonlyGraph<Value> {
  public addNode(node: Value): Value {
    this.nodeList.push(node);
    return node;
  }

  public addEdge(source: Value, target: Value): Edge<Value> {
    const edge: Edge<Value> = [source, target];
    this.edgeList.push(edge);
    if (!this.nodeToEdgeMap.has(source)) {
      this.nodeToEdgeMap.set(source, []);
    }
    this.nodeToEdgeMap.get(source).push(edge);
    return edge;
  }

  public removeNode(node: Value): void {
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

  public removeEdge(edge: Edge<Value>): void {
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
