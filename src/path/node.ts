export const createNode = <type>(id: string, data: type, resist: number, priority: number, cameFrom?: Node<type>): Node<type> => ({
  id, data, resist, priority,
  cameFrom: cameFrom || null,
  hasBeenRoot: false,
});

export interface Node<type> {
  id: string;
  data: type;
  resist: number;
  priority: number;
  cameFrom: Node<type> | null;
  hasBeenRoot: boolean;
}
