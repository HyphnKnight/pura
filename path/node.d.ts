export declare const createNode: <type>(id: string, data: type, resist: number, priority: number, cameFrom?: node<type> | undefined) => node<type>;
export declare type node<type> = {
    id: string;
    data: type;
    resist: number;
    priority: number;
    cameFrom: node<type> | null;
    hasBeenRoot: boolean;
};
