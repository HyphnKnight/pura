import { remove } from '../array';
import mergeSort from '../array/mergeSort';
import { uniqueId } from '../string';

export interface GraphEdge<Value> {
  readonly id: string;
  readonly source: GraphNode<Value>;
  readonly target: GraphNode<Value>;
}

export interface GraphNode<Value> {
  readonly id: string;
  readonly value: Value;
}

export interface GraphData<Value> {
  values: Value[];
  edges: Array<[number, number]>;
  getUniqueId: (value: Value) => string;
}

export interface UserEdge<Value> {
  readonly id: string;
  readonly source: Value;
  readonly target: Value;
}

export interface GraphPathEdge<Value> {
  readonly edge: GraphEdge<Value>;
  readonly prev: GraphPathEdge<Value> | null;
  readonly resist: number;
  readonly priority: number;
}

export class ReadonlyGraph<Value> {
  protected readonly valueList: Value[];
  protected readonly userEdgeList: Array<UserEdge<Value>>;
  protected readonly nodeList: Array<GraphNode<Value>>;
  protected readonly edgeList: Array<GraphEdge<Value>>;

  protected readonly nodeMap: { [nodeId: string]: GraphNode<Value> } = {};
  protected readonly nodeEdgeMap: { [nodeId: string]: Array<GraphEdge<Value>> } = {};
  protected readonly edgeMap: { [edgeId: string]: GraphEdge<Value> } = {};

  protected readonly getUniqueId: (value: Value) => string;

  constructor({ getUniqueId, values, edges }: GraphData<Value>) {
    this.valueList = values;
    this.userEdgeList = [];
    this.getUniqueId = getUniqueId;

    for (let v = 0; v < values.length; ++v) {
      const value = values[v];
      const node = {
        id: this.getUniqueId(value),
        value,
      };
      this.nodeMap[node.id] = node;
      this.nodeEdgeMap[node.id] = [];
      this.nodeList.push(node);
    }

    for (let e = 0; e < edges.length; ++e) {
      const [indexOfSource, indexOfTarget] = edges[e];
      const source = this.nodeList[indexOfSource];
      const target = this.nodeList[indexOfTarget];
      const edge = { id: uniqueId(), source, target };
      this.edgeList.push(edge);
      this.userEdgeList.push(this.convertGraphEdgeToUserEdge(edge));
      this.nodeEdgeMap[source.id].push(edge);
      this.edgeMap[edge.id] = edge;
    }
  }

  get values() {
    return this.valueList as ReadonlyArray<Value>;
  }

  get edges() {
    return this.userEdgeList as ReadonlyArray<UserEdge<Value>>;
  }

  public getEdges(root: Value): Array<UserEdge<Value>> {
    return this.nodeEdgeMap[this.getUniqueId(root)].map(this.convertGraphEdgeToUserEdge);
  }

  public getNeighbors(root: Value): Value[] {
    return this.getEdges(root).map(({ target }) => target);
  }

  public getWithin(root: Value, connections: number): Value[] {
    const rootNode = this.nodeMap[this.getUniqueId(root)];
    const touchedNodes = new Set();
    let nextNodes = [rootNode];
    for (let c = 0; c < connections; ++c) {
      const nextNodesToCheck = [];
      for (const node of nextNodes) {
        touchedNodes.add(node);
        const validNodes = this.getNeighborNodes(node)
          .filter((neighborNode) => !touchedNodes.has(neighborNode));
        nextNodesToCheck.push(...validNodes);
      }
      nextNodes = nextNodesToCheck;
    }
    return Array.from(touchedNodes).map(({ value }) => value);
  }

  public getWithinConditional(
    root: Value,
    checkIfValid: (root: Value, target: Value) => boolean,
  ): Value[] {
    const rootNode = this.nodeMap[this.getUniqueId(root)];
    const touchedNodes = new Set();
    let nodesToCheck = [rootNode];
    while (!!nodesToCheck.length) {
      const nextNodesToCheck = [];
      for (const node of nodesToCheck) {
        touchedNodes.add(node);
        const validNodes = this.getNeighborNodes(node)
          .filter((neighborNode) => {
            if (touchedNodes.has(neighborNode)) {
              return false;
            }
            return checkIfValid(root, neighborNode.value);
          });
        nextNodesToCheck.push(...validNodes);
      }
      nodesToCheck = nextNodesToCheck;
    }
    return Array.from(touchedNodes).map(({ value }) => value);
  }

  public createPathfinder(
    resist: (source: Value, target: Value) => number,
    heuristic: (goal: Value) => (target: Value) => number,
    maxResist: number = Infinity,
  ) {
    return (root: Value, target: Value): Value[] | null => {
      const createPathEdgeFromEdge = this.makeCreatePathEdgeFromEdge(resist, heuristic(target));
      const goalNode = this.getNode(target);
      const rootNode = this.getNode(root);
      let frontier: Array<GraphPathEdge<Value>> =
        this.getInternalEdges(rootNode)
          .map(createPathEdgeFromEdge(null));
      while (!!frontier.length) {
        const currentEdge = frontier.shift()!;
        if (currentEdge.edge.target === goalNode) {
          return this.createPathFromEdge(currentEdge);
        }
        frontier.push(
          ...this.getInternalEdges(currentEdge.edge.target)
            .filter(({ target: edgeTarget }) => edgeTarget !== currentEdge.edge.target)
            .map(createPathEdgeFromEdge(currentEdge))
            .filter(({ resist: edgeResist }) => edgeResist > maxResist),
        );

        frontier = mergeSort(frontier, ({ priority }) => priority);
      }
      return null;
    };
  }

  protected convertGraphEdgeToUserEdge =
    (graphEdge: GraphEdge<Value>): UserEdge<Value> => ({
      id: graphEdge.id,
      source: graphEdge.source.value,
      target: graphEdge.target.value,
    })

  protected edgeContainsNode =
    (node: GraphNode<Value>) =>
      (edge: GraphEdge<Value>): boolean =>
        edge.source.id === node.id || edge.target.id === node.id

  protected createPathFromEdge =
    (lastEdge: GraphPathEdge<Value>) => {
      const path: Value[] = [lastEdge.edge.target.value];
      let currentEdge = lastEdge;
      while (currentEdge) {
        path.unshift(currentEdge.edge.source.value);
        currentEdge = currentEdge.prev;
      }
      return path;
    }

  protected makeCreatePathEdgeFromEdge =
    (
      resist: (source: Value, target: Value) => number,
      heuristic: (target: Value) => number) =>
      (prev: GraphPathEdge<Value> | null) =>
        (edge: GraphEdge<Value>): GraphPathEdge<Value> => ({
          edge,
          prev,
          resist: resist(edge.source.value, edge.target.value),
          priority: heuristic(edge.target.value),
        })

  protected getNode(root: Value): GraphNode<Value> {
    return this.nodeMap[this.getUniqueId(root)];
  }

  protected getInternalEdges(root: GraphNode<Value>): Array<GraphEdge<Value>> {
    return this.nodeEdgeMap[root.id];
  }

  protected getNeighborNodes(root: GraphNode<Value>): Array<GraphNode<Value>> {
    return this.nodeEdgeMap[root.id].map(({ target }) => target);
  }
}

export class Graph<Value> extends ReadonlyGraph<Value> {
  public addNode(value: Value): Value {
    const node = { id: this.getUniqueId(value), value };
    this.nodeList.push(node);
    this.valueList.push(value);
    return node.value;
  }

  public addEdge(source: Value, target: Value): UserEdge<Value> {
    const sourceNode = this.nodeMap[this.getUniqueId(source)];
    const targetNode = this.nodeMap[this.getUniqueId(target)];
    const edge = {
      id: uniqueId(),
      source: sourceNode,
      target: targetNode,
    };
    this.edgeList.push(edge);
    this.edgeMap[edge.id] = edge;
    return this.convertGraphEdgeToUserEdge(edge);
  }

  public removeNode(node: GraphNode<Value>): void {
    remove(this.nodeList, node);
    remove(this.valueList, node.value);
    let i = 0;
    const containsNode = this.edgeContainsNode(node);
    while (i < this.edgeList.length) {
      const edge = this.edgeList[i];
      if (containsNode(edge)) {
        this.edgeList.splice(i, 1);
      } else {
        ++i;
      }
    }
  }

  public removeEdge(edge: UserEdge<Value>): void {
    const internalEdge = this.edgeMap[edge.id];
    remove(this.edgeList, internalEdge);
    delete this.edgeMap[edge.id];
  }
}
