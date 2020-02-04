import { remove } from '../array';
import { getReachable, pathTo } from '../path';
export class ReadonlyGraph {
    constructor({ nodes, edges: edgeLookups }) {
        // tslint:disable-next-line: member-ordering
        this.getWithin = this.createGetReachable(() => 1);
        this.nodeList = [...nodes];
        this.edgeList = [...edgeLookups.map(([sourceIndex, targetIndex]) => [
                this.nodeList[sourceIndex],
                this.nodeList[targetIndex],
            ])];
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
        return this.nodeList;
    }
    get edges() {
        return this.edgeList;
    }
    getEdges(root) {
        return this.nodeToEdgeMap.get(root);
    }
    getNeighbors(root) {
        return this.getEdges(root).map(([, target]) => target);
    }
    createPathTo(resist, heuristic, maxResist = Infinity) {
        return pathTo((value) => this.getNeighbors(value), resist, heuristic, maxResist);
    }
    createGetReachable(resist) {
        return getReachable((value) => this.getNeighbors(value), resist);
    }
    toJSON() {
        return {
            nodes: this.nodeList,
            edges: this.edges.map(([source, target]) => [
                this.nodeList.indexOf(source),
                this.nodeList.indexOf(target),
            ]),
        };
    }
}
export class Graph extends ReadonlyGraph {
    addNode(node) {
        this.nodeList.push(node);
        return node;
    }
    addEdge(source, target) {
        const edge = [source, target];
        this.edgeList.push(edge);
        if (!this.nodeToEdgeMap.has(source)) {
            this.nodeToEdgeMap.set(source, []);
        }
        this.nodeToEdgeMap.get(source).push(edge);
        return edge;
    }
    removeNode(node) {
        remove(this.nodeList, node);
        let i = 0;
        while (i < this.edgeList.length) {
            const [source, target] = this.edgeList[i];
            if (source === node || target === node) {
                this.edgeList.splice(i, 1);
            }
            else {
                ++i;
            }
        }
    }
    removeEdge(edge) {
        let i = 0;
        while (i < this.edgeList.length) {
            const edgeToMatch = this.edgeList[i];
            if (edgeToMatch[0] === edge[0] &&
                edgeToMatch[1] === edge[1]) {
                this.edgeList.splice(i, 1);
            }
            else {
                ++i;
            }
        }
    }
}
