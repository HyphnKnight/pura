export declare type objLit<Value> = {
    [prop: string]: Value;
};
export interface iterator<Value, Result> {
    (value: Value, key: string, obj: objLit<Value>): Result;
}
export declare const forEach: <Value>(obj: objLit<Value>, func: iterator<Value, void>) => string[];
export declare const mapValues: <Value, Result>(obj: objLit<Value>, func: iterator<Value, Result>) => objLit<Result>;
export declare const mapKeys: <Value>(obj: objLit<Value>, func: iterator<Value, string | number>) => objLit<Value>;
export declare const pick: <Value extends Result, Result>(obj: objLit<Value>, func: iterator<Value, boolean>) => objLit<Result>;
export declare const match: <type extends {
    [id: string]: any;
}>(match: Partial<type>) => (obj: type) => boolean;
export declare const copy: <type>(obj: type) => any;
export declare const mapToArray: <Value, Result>(obj: objLit<Value>, iterator: iterator<Value, Result>) => Result[];
export declare const pairs: <Value>(obj: objLit<Value>) => [string, Value][];
export declare const merge: <type>(obj: type, ...objs: Partial<type>[]) => type;
export declare const get: <type>(obj: any, path: string, defaultValue: type) => type;
export declare const set: <type extends {
    [id: string]: any;
}, value>(obj: type, path: string, value: value) => type;
export declare const findKey: <type extends {
    [id: string]: any;
}>(obj: type, predicate: (key: string | number, value: any) => boolean) => string | null;
export declare const findValue: <type extends {
    [id: string]: any;
}>(obj: type, predicate: (key: string | number, value: any) => boolean) => any;
