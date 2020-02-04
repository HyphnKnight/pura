export interface GraphData<Node> {
    nodes: Node[];
    edges: Array<[number, number]>;
}
export declare type Edge<Node> = [Node, Node];
export declare class ReadonlyGraph<Node> {
    protected readonly nodeList: Node[];
    protected readonly edgeList: Array<Edge<Node>>;
    protected readonly nodeToEdgeMap: Map<Node, Array<Edge<Node>>>;
    constructor({nodes, edges: edgeLookups}: GraphData<Node>);
    readonly nodes: ReadonlyArray<Node>;
    readonly edges: ReadonlyArray<[Node, Node]>;
    getEdges(root: Node): Array<Edge<Node>>;
    getNeighbors(root: Node): Node[];
    createPathTo(resist: (current: Node, neighbor: Node) => number, heuristic: (goal: Node, neighbor: Node) => number, maxResist?: number): (start: Node, goal: Node) => Node[] | null;
    createGetReachable(resist: (current: Node, neighbor: Node) => number): (start: Node, maxResist?: number) => Node[];
    readonly getWithin: (start: Node, maxResist?: number) => Node[];
    toJSON(): GraphData<Node>;
}
export declare class Graph<Node> extends ReadonlyGraph<Node> {
    addNode(node: Node): Node;
    addEdge(source: Node, target: Node): Edge<Node>;
    removeNode(node: Node): void;
    removeEdge(edge: Edge<Node>): void;
}
